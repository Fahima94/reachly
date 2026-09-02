import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Connexion({ onAllerInscription, onMotDePasseOublie }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [statut, setStatut] = useState('idle') // idle | chargement | succes
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
      if (!password) setErreurMotDePasse('Renseignez votre mot de passe.')
      return
    }

    setStatut('chargement')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        // Identifiants invalides — message générique, sans préciser lequel des
        // deux champs est en cause (ni si le compte existe).
        if (error.status === 400) {
          setErreurGlobale('Identifiant ou mot de passe incorrect')
          setStatut('idle')
          return
        }
        // Échec technique
        setErreurGlobale('La connexion a échoué. Vérifiez votre connexion et réessayez.')
        setStatut('idle')
        return
      }

      if (data.session) {
        setStatut('succes')
      } else {
        // Cas imprévu par l'API (pas d'erreur mais pas de session non plus).
        setErreurGlobale('La connexion a échoué. Vérifiez votre connexion et réessayez.')
        setStatut('idle')
      }
    } catch {
      setErreurGlobale('La connexion a échoué. Vérifiez votre connexion et réessayez.')
      setStatut('idle')
    }
  }

  if (statut === 'succes') {
    return (
      <main>
        <p role="status">Vous êtes connecté·e.</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Se connecter</h1>
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={erreurMotDePasse ? 'password-erreur' : undefined}
            aria-invalid={erreurMotDePasse ? 'true' : 'false'}
          />
          {erreurMotDePasse && (
            <p id="password-erreur" role="alert">
              {erreurMotDePasse}
            </p>
          )}
        </div>

        <button type="submit" disabled={enCours} aria-busy={enCours}>
          {enCours ? 'Connexion en cours…' : 'Se connecter'}
        </button>

        <p>
          <button type="button" onClick={onMotDePasseOublie}>
            Mot de passe oublié ?
          </button>
        </p>
        <p>
          <button type="button" onClick={onAllerInscription}>
            Créer un compte
          </button>
        </p>
      </form>
    </main>
  )
}
