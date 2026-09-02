import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { PASSWORD_RULES, passwordRespecteLesRegles } from '../lib/passwordRules.js'

export default function NouveauMotDePasse({ onRefaireDemande }) {
  const [password, setPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [statut, setStatut] = useState('idle') // idle | chargement | succes
  const [erreurGlobale, setErreurGlobale] = useState('')
  const [erreurMotDePasse, setErreurMotDePasse] = useState('')

  const enCours = statut === 'chargement'

  async function gererEnvoi(evenement) {
    evenement.preventDefault()
    setErreurGlobale('')
    setErreurMotDePasse('')

    // Champ vide
    if (!password) {
      setErreurMotDePasse('Choisissez un mot de passe.')
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
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        // Le lien a expiré ou a déjà été utilisé entre le chargement de
        // l'écran et la soumission : la session de récupération n'est plus valide.
        if (error.status === 401 || error.status === 403) {
          onRefaireDemande()
          return
        }
        setErreurGlobale('La modification a échoué. Vérifiez votre connexion et réessayez.')
        setStatut('idle')
        return
      }

      setStatut('succes')
    } catch {
      setErreurGlobale('La modification a échoué. Vérifiez votre connexion et réessayez.')
      setStatut('idle')
    }
  }

  if (statut === 'succes') {
    return (
      <main>
        <p role="status">Votre mot de passe est modifié. Vous pouvez vous connecter avec.</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Choisir un nouveau mot de passe</h1>
      <form onSubmit={gererEnvoi} noValidate>
        {erreurGlobale && (
          <p role="alert" className="erreur-globale">
            {erreurGlobale}
          </p>
        )}

        <div>
          <label htmlFor="password">Nouveau mot de passe</label>
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
          {enCours ? 'Enregistrement en cours…' : 'Choisir ce mot de passe'}
        </button>
      </form>
    </main>
  )
}
