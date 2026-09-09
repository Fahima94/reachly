import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import EnteteConnecte from '../components/EnteteConnecte.jsx'

// Écran intercalé, uniquement pour le parcours "Continuer avec LinkedIn" —
// l'inscription classique capture le consentement CGU avant même de créer
// la session (case à cocher du formulaire), mais LinkedIn (OIDC) établit une
// session directement au retour, sans étape équivalente. App.jsx détecte ce
// cas (fournisseur LinkedIn + `user_metadata.consentement_cgu` absent) et
// route ici avant d'ouvrir l'onboarding ou le tableau de bord.
export default function ConsentementLinkedin({ onNaviguer, onDeconnexionReussie, onAccepte }) {
  const [accepte, setAccepte] = useState(false)
  const [erreur, setErreur] = useState('')
  const [enCours, setEnCours] = useState(false)

  async function gererContinuer(evenement) {
    evenement.preventDefault()
    setErreur('')

    if (!accepte) {
      setErreur(
        "Vous devez accepter les conditions d'utilisation et la politique de confidentialité pour continuer.",
      )
      return
    }

    setEnCours(true)
    const { error } = await supabase.auth.updateUser({ data: { consentement_cgu: true } })
    if (error) {
      setErreur("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
      setEnCours(false)
      return
    }
    onAccepte()
  }

  return (
    <main>
      <EnteteConnecte onNaviguer={onNaviguer} onDeconnexionReussie={onDeconnexionReussie} />
      <header>
        <h1>Avant de continuer</h1>
      </header>
      <p>
        Vous êtes connecté·e via LinkedIn. Pour utiliser Reachly, il reste une dernière étape.
      </p>
      <form onSubmit={gererContinuer} noValidate>
        {erreur && (
          <p id="conditions-linkedin-erreur" role="alert" className="erreur-globale">
            {erreur}
          </p>
        )}
        <div className="champ-conditions">
          <label htmlFor="conditions-linkedin">
            <input
              id="conditions-linkedin"
              type="checkbox"
              checked={accepte}
              onChange={(e) => setAccepte(e.target.checked)}
              aria-describedby={erreur ? 'conditions-linkedin-erreur' : undefined}
              aria-invalid={erreur ? 'true' : 'false'}
            />
            J'accepte les conditions d'utilisation et la politique de confidentialité de Reachly.
          </label>
        </div>
        <button type="submit" disabled={enCours} aria-busy={enCours}>
          {enCours ? 'Un instant…' : 'Continuer'}
        </button>
      </form>
    </main>
  )
}
