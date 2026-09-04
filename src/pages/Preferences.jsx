import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const VOIX_NARRATIVES = [
  { valeur: 'je_masculin', libelle: 'Je (masculin)' },
  { valeur: 'je_feminin', libelle: 'Je (féminin)' },
  { valeur: 'nous', libelle: 'Nous (1ʳᵉ personne du pluriel)' },
]

export default function Preferences({ onRetour }) {
  const [metiers, setMetiers] = useState([])
  const [secteurs, setSecteurs] = useState([])
  const [categories, setCategories] = useState([])
  const [sources, setSources] = useState([])
  const [tonalites, setTonalites] = useState([])

  const [selectionMetiersSecteurs, setSelectionMetiersSecteurs] = useState(new Set())
  const [selectionCategories, setSelectionCategories] = useState(new Set())
  const [selectionSources, setSelectionSources] = useState(new Set())
  const [tonaliteChoisie, setTonaliteChoisie] = useState('')
  const [voixChoisie, setVoixChoisie] = useState('')

  const [chargementInitial, setChargementInitial] = useState(true)
  const [erreurChargement, setErreurChargement] = useState('')
  const [statut, setStatut] = useState('idle') // idle | chargement
  const [erreurGlobale, setErreurGlobale] = useState('')
  const [erreurCategories, setErreurCategories] = useState('')
  const [erreurTonalite, setErreurTonalite] = useState('')
  const [erreurVoix, setErreurVoix] = useState('')

  const enCours = statut === 'chargement'

  async function charger() {
    setErreurChargement('')
    setChargementInitial(true)
    try {
      const {
        data: { user },
        error: erreurUtilisateur,
      } = await supabase.auth.getUser()

      if (erreurUtilisateur || !user) {
        setErreurChargement('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
        setChargementInitial(false)
        return
      }

      const [catsReponse, sourcesReponse, tonalitesReponse, profilReponse] = await Promise.all([
        supabase.from('Catégories').select('id, nom, type').order('nom'),
        supabase.from('Sources').select('id, nom').eq('actif', true).order('nom'),
        supabase
          .from('Tonalités')
          .select('id, "Visée de la publication", descriptif')
          .order('Visée de la publication'),
        supabase
          .from('profiles')
          .select('préférences, "Tonalité_défaut", voix_narrative')
          .eq('id', user.id)
          .maybeSingle(),
      ])

      if (
        catsReponse.error ||
        sourcesReponse.error ||
        tonalitesReponse.error ||
        profilReponse.error
      ) {
        setErreurChargement('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
        setChargementInitial(false)
        return
      }

      const listeMetiers = catsReponse.data.filter((c) => c.type === 'métier')
      const listeSecteurs = catsReponse.data.filter((c) => c.type === 'secteur')
      const listeCategories = catsReponse.data.filter((c) => c.type === 'thème')
      setMetiers(listeMetiers)
      setSecteurs(listeSecteurs)
      setCategories(listeCategories)
      setSources(sourcesReponse.data)
      setTonalites(tonalitesReponse.data)

      const { data: liens, error: erreurLiens } = await supabase
        .from('profils_categories')
        .select('category_id')
        .eq('user_id', user.id)

      if (erreurLiens) {
        setErreurChargement('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
        setChargementInitial(false)
        return
      }

      const idsMetiersSecteurs = new Set([...listeMetiers, ...listeSecteurs].map((c) => c.id))
      const idsCategories = new Set(listeCategories.map((c) => c.id))
      const idsChoisis = liens.map((l) => l.category_id)
      setSelectionMetiersSecteurs(new Set(idsChoisis.filter((id) => idsMetiersSecteurs.has(id))))
      setSelectionCategories(new Set(idsChoisis.filter((id) => idsCategories.has(id))))

      const sourcesActives = profilReponse.data?.préférences?.sources_actives ?? []
      setSelectionSources(new Set(sourcesActives))
      setTonaliteChoisie(profilReponse.data?.['Tonalité_défaut'] ?? '')
      setVoixChoisie(profilReponse.data?.voix_narrative ?? '')

      setChargementInitial(false)
    } catch {
      setErreurChargement('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
      setChargementInitial(false)
    }
  }

  useEffect(() => {
    charger()
  }, [])

  function basculer(setEnsemble, id) {
    setEnsemble((precedent) => {
      const suivant = new Set(precedent)
      if (suivant.has(id)) {
        suivant.delete(id)
      } else {
        suivant.add(id)
      }
      return suivant
    })
  }

  async function gererEnregistrement(evenement) {
    evenement.preventDefault()
    setErreurGlobale('')
    setErreurCategories('')
    setErreurTonalite('')
    setErreurVoix('')

    let bloque = false
    if (selectionCategories.size === 0) {
      setErreurCategories('Choisissez au moins une catégorie.')
      bloque = true
    }
    if (!tonaliteChoisie) {
      setErreurTonalite('Choisissez une tonalité.')
      bloque = true
    }
    if (!voixChoisie) {
      setErreurVoix('Choisissez une voix narrative.')
      bloque = true
    }
    if (bloque) return

    setStatut('chargement')
    try {
      const {
        data: { user },
        error: erreurUtilisateur,
      } = await supabase.auth.getUser()

      if (erreurUtilisateur || !user) {
        setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
        setStatut('idle')
        return
      }

      // Métiers/secteurs/catégories : purge complète de profils_categories
      // pour cette personne, puis réinsertion — un seul enregistrement
      // global couvre les trois listes en même temps.
      const { error: erreurSuppression } = await supabase
        .from('profils_categories')
        .delete()
        .eq('user_id', user.id)

      if (erreurSuppression) {
        setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
        setStatut('idle')
        return
      }

      const idsRetenus = [...selectionMetiersSecteurs, ...selectionCategories]
      if (idsRetenus.length > 0) {
        const lignes = idsRetenus.map((categoryId) => ({
          user_id: user.id,
          category_id: categoryId,
        }))
        const { error: erreurInsertion } = await supabase
          .from('profils_categories')
          .insert(lignes)

        if (erreurInsertion) {
          setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
          setStatut('idle')
          return
        }
      }

      const { data: profilExistant, error: erreurLecture } = await supabase
        .from('profiles')
        .select('préférences')
        .eq('id', user.id)
        .maybeSingle()

      if (erreurLecture) {
        setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
        setStatut('idle')
        return
      }

      const preferencesExistantes = profilExistant?.préférences ?? {}
      const { error: erreurEnregistrement } = await supabase.from('profiles').upsert({
        id: user.id,
        préférences: {
          ...preferencesExistantes,
          sources_actives: [...selectionSources],
        },
        Tonalité_défaut: tonaliteChoisie,
        voix_narrative: voixChoisie,
      })

      if (erreurEnregistrement) {
        setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
        setStatut('idle')
        return
      }

      onRetour()
    } catch {
      setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
      setStatut('idle')
    }
  }

  return (
    <main>
      <header>
        <h1>Mes préférences</h1>
        <button type="button" onClick={onRetour} disabled={enCours}>
          Retour au tableau de bord
        </button>
      </header>

      {chargementInitial && <p role="status">Chargement de vos préférences…</p>}

      {!chargementInitial && erreurChargement && (
        <div>
          <p role="alert" className="erreur-globale">
            {erreurChargement}
          </p>
          <button type="button" onClick={charger}>
            Réessayer
          </button>
        </div>
      )}

      {!chargementInitial && !erreurChargement && (
        <form onSubmit={gererEnregistrement} noValidate>
          {erreurGlobale && (
            <p role="alert" className="erreur-globale">
              {erreurGlobale}
            </p>
          )}

          <fieldset>
            <legend>Vos métiers</legend>
            {metiers.map((metier) => (
              <label key={metier.id}>
                <input
                  type="checkbox"
                  checked={selectionMetiersSecteurs.has(metier.id)}
                  onChange={() => basculer(setSelectionMetiersSecteurs, metier.id)}
                />
                {metier.nom}
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>Vos secteurs d'activité</legend>
            {secteurs.map((secteur) => (
              <label key={secteur.id}>
                <input
                  type="checkbox"
                  checked={selectionMetiersSecteurs.has(secteur.id)}
                  onChange={() => basculer(setSelectionMetiersSecteurs, secteur.id)}
                />
                {secteur.nom}
              </label>
            ))}
          </fieldset>

          <fieldset aria-describedby={erreurCategories ? 'categories-erreur' : undefined}>
            <legend>Catégories (au moins une)</legend>
            {erreurCategories && (
              <p id="categories-erreur" role="alert">
                {erreurCategories}
              </p>
            )}
            {categories.map((categorie) => (
              <label key={categorie.id}>
                <input
                  type="checkbox"
                  checked={selectionCategories.has(categorie.id)}
                  onChange={() => basculer(setSelectionCategories, categorie.id)}
                />
                {categorie.nom}
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>Sources actives (facultatif)</legend>
            {sources.map((source) => (
              <label key={source.id}>
                <input
                  type="checkbox"
                  checked={selectionSources.has(source.id)}
                  onChange={() => basculer(setSelectionSources, source.id)}
                />
                {source.nom}
              </label>
            ))}
          </fieldset>

          <fieldset aria-describedby={erreurTonalite ? 'tonalite-erreur' : undefined}>
            <legend>Tonalité</legend>
            {erreurTonalite && (
              <p id="tonalite-erreur" role="alert">
                {erreurTonalite}
              </p>
            )}
            {tonalites.map((tonalite) => (
              <label key={tonalite.id}>
                <input
                  type="radio"
                  name="tonalite"
                  value={tonalite.id}
                  checked={tonaliteChoisie === tonalite.id}
                  onChange={() => setTonaliteChoisie(tonalite.id)}
                />
                {tonalite['Visée de la publication']}
                {tonalite.descriptif && <span> — {tonalite.descriptif}</span>}
              </label>
            ))}
          </fieldset>

          <fieldset aria-describedby={erreurVoix ? 'voix-erreur' : undefined}>
            <legend>Voix narrative</legend>
            {erreurVoix && (
              <p id="voix-erreur" role="alert">
                {erreurVoix}
              </p>
            )}
            {VOIX_NARRATIVES.map((voix) => (
              <label key={voix.valeur}>
                <input
                  type="radio"
                  name="voix-narrative"
                  value={voix.valeur}
                  checked={voixChoisie === voix.valeur}
                  onChange={() => setVoixChoisie(voix.valeur)}
                />
                {voix.libelle}
              </label>
            ))}
          </fieldset>

          <button type="submit" disabled={enCours} aria-busy={enCours}>
            {enCours ? 'Enregistrement en cours…' : 'Enregistrer'}
          </button>
        </form>
      )}
    </main>
  )
}
