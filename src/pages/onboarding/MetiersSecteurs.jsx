import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

export default function MetiersSecteurs({ onEtapeSuivante }) {
  const [metiers, setMetiers] = useState([])
  const [secteurs, setSecteurs] = useState([])
  const [selection, setSelection] = useState(new Set())
  const [chargementListe, setChargementListe] = useState(true)
  const [erreurListe, setErreurListe] = useState('')
  const [statut, setStatut] = useState('idle') // idle | chargement
  const [erreurGlobale, setErreurGlobale] = useState('')

  const enCours = statut === 'chargement'

  async function charger() {
    setErreurListe('')
    setChargementListe(true)
    try {
      const { data, error } = await supabase
        .from('Catégories')
        .select('id, nom, type')
        .in('type', ['métier', 'secteur'])
        .order('nom')

      if (error) {
        setErreurListe('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
        setChargementListe(false)
        return
      }

      const listeMetiers = data.filter((c) => c.type === 'métier')
      const listeSecteurs = data.filter((c) => c.type === 'secteur')
      setMetiers(listeMetiers)
      setSecteurs(listeSecteurs)

      // Pré-cochage : lit les choix métier/secteur déjà en base (relance de
      // l'onboarding). Un premier onboarding n'a aucune ligne → Set vide.
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const idsMetiersSecteurs = [...listeMetiers, ...listeSecteurs].map((c) => c.id)
        const { data: liens, error: erreurLiens } = await supabase
          .from('profils_categories')
          .select('category_id')
          .eq('user_id', user.id)
          .in('category_id', idsMetiersSecteurs)

        if (erreurLiens) {
          setErreurListe('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
          setChargementListe(false)
          return
        }

        setSelection(new Set(liens.map((l) => l.category_id)))
      }

      setChargementListe(false)
    } catch {
      setErreurListe('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
      setChargementListe(false)
    }
  }

  useEffect(() => {
    charger()
  }, [])

  function basculer(id) {
    setSelection((precedent) => {
      const suivant = new Set(precedent)
      if (suivant.has(id)) {
        suivant.delete(id)
      } else {
        suivant.add(id)
      }
      return suivant
    })
  }

  async function gererValidation(evenement) {
    evenement.preventDefault()
    setErreurGlobale('')
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

      // Purge ciblée : uniquement les catégories métier/secteur de cette
      // personne, pour ne pas toucher d'éventuelles sélections "thème".
      const idsMetiersSecteurs = [...metiers, ...secteurs].map((c) => c.id)
      const { error: erreurSuppression } = await supabase
        .from('profils_categories')
        .delete()
        .eq('user_id', user.id)
        .in('category_id', idsMetiersSecteurs)

      if (erreurSuppression) {
        setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
        setStatut('idle')
        return
      }

      if (selection.size > 0) {
        const lignes = [...selection].map((categoryId) => ({
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

      onEtapeSuivante()
    } catch {
      setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
      setStatut('idle')
    }
  }

  function gererIgnorer() {
    onEtapeSuivante()
  }

  return (
    <main>
      <p>Étape 2 sur 5</p>
      <p>Ces informations nous aident à mieux orienter votre veille et vos posts.</p>
      <h1>Vos métiers et secteurs d'activité</h1>

      {chargementListe && <p role="status">Chargement de vos réponses…</p>}

      {!chargementListe && erreurListe && (
        <div>
          <p role="alert" className="erreur-globale">
            {erreurListe}
          </p>
          <button type="button" onClick={charger}>
            Réessayer
          </button>
        </div>
      )}

      {!chargementListe && !erreurListe && (
        <form onSubmit={gererValidation} noValidate>
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
                  checked={selection.has(metier.id)}
                  onChange={() => basculer(metier.id)}
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
                  checked={selection.has(secteur.id)}
                  onChange={() => basculer(secteur.id)}
                />
                {secteur.nom}
              </label>
            ))}
          </fieldset>

          <button type="submit" disabled={enCours} aria-busy={enCours}>
            {enCours ? 'Enregistrement en cours…' : 'Suivant'}
          </button>

          <p>
            <button type="button" onClick={gererIgnorer} disabled={enCours}>
              Ignorer cette étape
            </button>
          </p>
        </form>
      )}
    </main>
  )
}
