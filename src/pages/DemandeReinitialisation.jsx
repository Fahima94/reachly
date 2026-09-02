import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function DemandeReinitialisation({ onAllerConnexion }) {
  const [email, setEmail] = useState('')
  const [statut, setStatut] = useState('idle') // idle | chargement | confirmation
  const [erreurGlobale, setErreurGlobale] = useState('')
  const [erreurEmail, setErreurEmail] = useState('')

  const enCours = statut === 'chargement'

  async function gererEnvoi(evenement) {
    evenement.preventDefault()
    setErreurGlobale('')
    setErreurEmail('')

    // Champ vide
    if (!email.trim()) {
      setErreurEmail('Renseignez votre adresse email.')
      return
    }

    setStatut('chargement')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      })

      // L'API ne révèle pas si l'adresse est associée à un compte : on affiche
      // la confirmation aussi bien en cas de succès que d'erreur "attendue".
      // Seul un échec technique (réseau, service indisponible) bloque.
      if (error && error.status && error.status >= 500) {
        setErreurGlobale('La demande a échoué. Vérifiez votre connexion et réessayez.')
        setStatut('idle')
        return
      }

      setStatut('confirmation')
    } catch {
      setErreurGlobale('La demande a échoué. Vérifiez votre connexion et réessayez.')
      setStatut('idle')
    }
  }

  if (statut === 'confirmation') {
    return (
      <main>
        <p role="status">
          Si un compte existe pour cette adresse, un email a été envoyé.
        </p>
        <p>
          <button type="button" onClick={onAllerConnexion}>
            Retour à la connexion
          </button>
        </p>
      </main>
    )
  }

  return (
    <main>
      <h1>Mot de passe oublié</h1>
      <p>Indiquez votre adresse email, nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
      <form onSubmit={gererEnvoi} noValidate>
        {erreurGlobale && (
          <p role="alert" className="erreur-globale">
            {erreurGlobale}
          </p>
        )}

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby={erreurEmail ? 'email-erreur' : undefined}
            aria-invalid={erreurEmail ? 'true' : 'false'}
          />
          {erreurEmail && (
            <p id="email-erreur" role="alert">
              {erreurEmail}
            </p>
          )}
        </div>

        <button type="submit" disabled={enCours} aria-busy={enCours}>
          {enCours ? 'Envoi en cours…' : 'Envoyer le lien'}
        </button>

        <p>
          <button type="button" onClick={onAllerConnexion}>
            Retour à la connexion
          </button>
        </p>
      </form>
    </main>
  )
}
