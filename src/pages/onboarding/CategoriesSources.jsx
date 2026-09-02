import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

export default function CategoriesSources({ onEtapeSuivante }) {
  const [categories, setCategories] = useState([])
  const [sources, setSources] = useState([])
  const [categoriesSelectionnees, setCategoriesSelectionnees] = useState(new Set())
  const [sourcesSelectionnees, setSourcesSelectionnees] = useState(new Set())
  const [chargementListe, setChargementListe] = useState(true)
  const [erreurListe, setErreurListe] = useState('')
  const [statut, setStatut] = useState('idle') // idle | chargement
  const [erreurGlobale, setErreurGlobale] = useState('')
  const [erreurCategories, setErreurCategories] = useState('')

  const enCours = statut === 'chargement'

  useEffect(() => {
    async function chargerListes() {
      const [categoriesReponse, sourcesReponse] = await Promise.all([
        supabase.from('Catégories').select('id, nom').eq('type', 'thème').order('nom'),
        supabase.from('Sources').select('id, nom').eq('actif', true).order('nom'),
      ])

      if (categoriesReponse.error || sourcesReponse.error) {
        setErreurListe('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
        setChargementListe(false)
        return
      }

      setCategories(categoriesReponse.data)
      setSources(sourcesReponse.data)
      setChargementListe(false)
    }
    chargerListes()
  }, [])

  function basculer(ensemble, setEnsemble, id) {
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

  async function gererValidation(evenement) {
    evenement.preventDefault()
    setErreurGlobale('')
    setErreurCategories('')

    // Au moins une catégorie obligatoire
    if (categoriesSelectionnees.size === 0) {
      setErreurCategories('Choisissez au moins une catégorie.')
      return
    }

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

      // Catégories (thème) : purge ciblée puis insertion, sans toucher aux
      // sélections métier/secteur du ticket précédent.
      const idsCategories = categories.map((c) => c.id)
      const { error: erreurSuppression } = await supabase
        .from('profils_categories')
        .delete()
        .eq('user_id', user.id)
        .in('category_id', idsCategories)

      if (erreurSuppression) {
        setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
        setStatut('idle')
        return
      }

      const lignesCategories = [...categoriesSelectionnees].map((categoryId) => ({
        user_id: user.id,
        category_id: categoryId,
      }))
      const { error: erreurInsertion } = await supabase
        .from('profils_categories')
        .insert(lignesCategories)

      if (erreurInsertion) {
        setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
        setStatut('idle')
        return
      }

      // Sources actives : fusionnées dans profiles.préférences (jsonb) pour
      // ne pas écraser d'autres clés qu'un futur ticket y aurait ajoutées.
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
      const { error: erreurPreferences } = await supabase.from('profiles').upsert({
        id: user.id,
        préférences: {
          ...preferencesExistantes,
          sources_actives: [...sourcesSelectionnees],
        },
      })

      if (erreurPreferences) {
        setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
        setStatut('idle')
        return
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
      <p>Étape 3 sur 5</p>
      <p>Ces informations nous aident à mieux orienter votre veille et vos posts.</p>
      <h1>Vos catégories et sources actives</h1>

      {erreurListe && (
        <p role="alert" className="erreur-globale">
          {erreurListe}
        </p>
      )}

      {!chargementListe && !erreurListe && (
        <form onSubmit={gererValidation} noValidate>
          {erreurGlobale && (
            <p role="alert" className="erreur-globale">
              {erreurGlobale}
            </p>
          )}

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
                  checked={categoriesSelectionnees.has(categorie.id)}
                  onChange={() =>
                    basculer(categoriesSelectionnees, setCategoriesSelectionnees, categorie.id)
                  }
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
                  checked={sourcesSelectionnees.has(source.id)}
                  onChange={() =>
                    basculer(sourcesSelectionnees, setSourcesSelectionnees, source.id)
                  }
                />
                {source.nom}
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
