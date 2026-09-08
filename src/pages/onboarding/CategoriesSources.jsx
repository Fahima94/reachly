import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import ProgressionOnboarding from '../../components/ProgressionOnboarding.jsx'
import EnteteConnecte from '../../components/EnteteConnecte.jsx'

export default function CategoriesSources({ onNaviguer, onDeconnexionReussie, onEtapeSuivante }) {
  const [categories, setCategories] = useState([])
  const [categoriesSelectionnees, setCategoriesSelectionnees] = useState(new Set())
  const [chargementListe, setChargementListe] = useState(true)
  const [erreurListe, setErreurListe] = useState('')
  const [statut, setStatut] = useState('idle') // idle | chargement
  const [erreurGlobale, setErreurGlobale] = useState('')
  const [erreurCategories, setErreurCategories] = useState('')

  const enCours = statut === 'chargement'

  // `estAnnule` protège contre le double montage de StrictMode en
  // développement : si ce chargement a été annulé (montage suivant déjà en
  // cours), on n'écrase pas un état plus frais avec une réponse en retard.
  async function charger(estAnnule = () => false) {
    setErreurListe('')
    setChargementListe(true)
    try {
      const { data: categoriesData, error: erreurCategories } = await supabase
        .from('Catégories')
        .select('id, nom')
        .eq('type', 'thème')
        .order('nom')
      if (estAnnule()) return

      if (erreurCategories) {
        setErreurListe('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
        setChargementListe(false)
        return
      }

      setCategories(categoriesData)

      // Pré-cochage : lit les catégories "thème" déjà en base (relance de
      // l'onboarding). Premier onboarding → rien à cocher.
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (estAnnule()) return

      if (user) {
        const idsCategories = categoriesData.map((c) => c.id)
        const { data: liens, error: erreurLiens } = await supabase
          .from('profils_categories')
          .select('category_id')
          .eq('user_id', user.id)
          .in('category_id', idsCategories)
        if (estAnnule()) return

        if (erreurLiens) {
          setErreurListe('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
          setChargementListe(false)
          return
        }

        setCategoriesSelectionnees(new Set(liens.map((l) => l.category_id)))
      }

      setChargementListe(false)
    } catch {
      if (estAnnule()) return
      setErreurListe('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
      setChargementListe(false)
    }
  }

  useEffect(() => {
    let annule = false
    charger(() => annule)
    return () => {
      annule = true
    }
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
      <EnteteConnecte onNaviguer={onNaviguer} onDeconnexionReussie={onDeconnexionReussie} />
      <ProgressionOnboarding etape={2} total={5} />
      <p>Ces informations nous aident à mieux orienter votre veille et vos posts.</p>
      <h1>Vos catégories</h1>

      {chargementListe && <p role="status">Chargement de vos réponses…</p>}

      {!chargementListe && erreurListe && (
        <div>
          <p role="alert" className="erreur-globale">
            {erreurListe}
          </p>
          <button type="button" onClick={() => charger()}>
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

          <fieldset className="chips" aria-describedby={erreurCategories ? 'categories-erreur' : undefined}>
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
