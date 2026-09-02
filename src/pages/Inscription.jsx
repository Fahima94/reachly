import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { PASSWORD_RULES, passwordRespecteLesRegles } from '../lib/passwordRules.js'
import BoutonDeconnexion from '../components/BoutonDeconnexion.jsx'

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Inscription({ onAllerConnexion, onDeconnexionReussie }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [statut, setStatut] = useState('idle') // idle | chargement | succes | attente-confirmation
  const [erreurGlobale, setErreurGlobale] = useState('')
  const [erreurEmail, setErreurEmail] = useState('')
  const [erreurMotDePasse, setErreurMotDePasse] = useState('')

  const enCours = statut === 'chargement'

  async function gererEnvoi(evenement) {
    evenement.preventDefault()
    setErreurGlobale('')
    setErreurEmail('')
    setErreurMotDePasse('')

    // Champ vide
    if (!email.trim() || !password) {
      if (!email.trim()) setErreurEmail('Renseignez votre adresse email.')
      if (!password) setErreurMotDePasse('Choisissez un mot de passe.')
      return
    }

    // Email invalide
    if (!EMAIL_FORMAT.test(email.trim())) {
      setErreurEmail("Cette adresse email n'est pas valide.")
      return
    }

    // Mot de passe refusé
    if (!passwordRespecteLesRegles(password)) {
      setPasswordTouched(true)
      setErreurMotDePasse('Le mot de passe ne respecte pas les règles ci-dessous.')
      return
    }

    setStatut('chargement')
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (error) {
        // Adresse déjà utilisée
        if (
          error.status === 422 ||
          /already registered|already exists/i.test(error.message ?? '')
        ) {
          setErreurEmail(
            'Un compte existe déjà pour cette adresse — connectez-vous ou récupérez votre mot de passe.',
          )
          setStatut('idle')
          return
        }
        // Échec technique
        setErreurGlobale(
          "La création du compte a échoué. Vérifiez votre connexion et réessayez.",
        )
        setStatut('idle')
        return
      }

      // Adresse déjà utilisée : Supabase répond 200 sans erreur mais avec un
      // tableau "identities" vide, pour ne pas révéler l'information via une
      // erreur explicite (comportement anti-énumération de l'API).
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setErreurEmail(
          'Un compte existe déjà pour cette adresse — connectez-vous ou récupérez votre mot de passe.',
        )
        setStatut('idle')
        return
      }

      // Selon la configuration Supabase, la session peut être immédiate
      // ou nécessiter une confirmation par email avant connexion.
      if (data.session) {
        setStatut('succes')
      } else {
        setStatut('attente-confirmation')
      }
    } catch {
      setErreurGlobale(
        "La création du compte a échoué. Vérifiez votre connexion et réessayez.",
      )
      setStatut('idle')
    }
  }

  if (statut === 'succes') {
    return (
      <main>
        <p role="status">Votre compte est créé, vous êtes connecté·e.</p>
        <BoutonDeconnexion onDeconnecte={onDeconnexionReussie} />
      </main>
    )
  }

  if (statut === 'attente-confirmation') {
    return (
      <main>
        <p role="status">
          Votre compte est créé. Consultez votre boîte email pour confirmer votre
          adresse avant de vous connecter.
        </p>
      </main>
    )
  }

  return (
    <main>
      <h1>Créer un compte</h1>
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

        <div>
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setPasswordTouched(true)
            }}
            aria-describedby="password-regles password-erreur"
            aria-invalid={erreurMotDePasse ? 'true' : 'false'}
          />
          {erreurMotDePasse && (
            <p id="password-erreur" role="alert">
              {erreurMotDePasse}
            </p>
          )}
          {passwordTouched && (
            <ul id="password-regles">
              {PASSWORD_RULES.map((rule) => {
                const respectee = rule.test(password)
                return (
                  <li key={rule.id}>
                    <span aria-hidden="true">{respectee ? '✓' : '○'}</span>{' '}
                    {rule.label} — {respectee ? 'respectée' : 'non respectée'}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <button type="submit" disabled={enCours} aria-busy={enCours}>
          {enCours ? 'Création en cours…' : 'Créer mon compte'}
        </button>

        <p>
          <button type="button" onClick={onAllerConnexion}>
            J'ai déjà un compte
          </button>
        </p>
      </form>
    </main>
  )
}
