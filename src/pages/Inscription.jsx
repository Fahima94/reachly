import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { PASSWORD_RULES, passwordRespecteLesRegles } from '../lib/passwordRules.js'
import BasculeConnexionInscription from '../components/BasculeConnexionInscription.jsx'
import BoutonAfficherMotDePasse from '../components/BoutonAfficherMotDePasse.jsx'
import LogoReachly from '../components/LogoReachly.jsx'

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Inscription({ onChangerMode, onInscriptionReussie }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [motDePasseVisible, setMotDePasseVisible] = useState(false)
  const [accepteConditions, setAccepteConditions] = useState(false)
  const refMotDePasse = useRef(null)
  const [statut, setStatut] = useState('idle') // idle | chargement
  const [erreurGlobale, setErreurGlobale] = useState('')
  const [erreurEmail, setErreurEmail] = useState('')
  const [erreurMotDePasse, setErreurMotDePasse] = useState('')
  const [erreurConditions, setErreurConditions] = useState('')

  const enCours = statut === 'chargement'

  async function gererEnvoi(evenement) {
    evenement.preventDefault()
    setErreurGlobale('')
    setErreurEmail('')
    setErreurMotDePasse('')
    setErreurConditions('')

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

    // Conditions non acceptées
    if (!accepteConditions) {
      setErreurConditions(
        "Vous devez accepter les conditions d'utilisation et la politique de confidentialité pour créer un compte.",
      )
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
            'Un compte existe déjà pour cette adresse — connectez-vous.',
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

      // La confirmation d'adresse par email est désactivée (voir cadrage) :
      // une inscription réussie ouvre directement une session. Sans session,
      // on traite le cas comme un échec technique.
      if (data.session) {
        onInscriptionReussie()
      } else {
        setErreurGlobale(
          "La création du compte a échoué. Vérifiez votre connexion et réessayez.",
        )
        setStatut('idle')
      }
    } catch {
      setErreurGlobale(
        "La création du compte a échoué. Vérifiez votre connexion et réessayez.",
      )
      setStatut('idle')
    }
  }

  return (
    <main>
      <LogoReachly />
      <BasculeConnexionInscription modeActif="inscription" onChangerMode={onChangerMode} />
      <h1>Créer un compte</h1>
      <form className="formulaire-auth" onSubmit={gererEnvoi} noValidate>
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
          <div className="champ-mot-de-passe">
            <input
              id="password"
              name="password"
              ref={refMotDePasse}
              type={motDePasseVisible ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordTouched(true)
              }}
              aria-describedby="password-regles password-erreur"
              aria-invalid={erreurMotDePasse ? 'true' : 'false'}
            />
            <BoutonAfficherMotDePasse
              visible={motDePasseVisible}
              onBasculer={() => {
                setMotDePasseVisible((v) => !v)
                refMotDePasse.current?.focus()
              }}
            />
          </div>
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

        <div className="champ-conditions">
          <label htmlFor="conditions">
            <input
              id="conditions"
              name="conditions"
              type="checkbox"
              checked={accepteConditions}
              onChange={(e) => setAccepteConditions(e.target.checked)}
              aria-describedby={erreurConditions ? 'conditions-erreur' : undefined}
              aria-invalid={erreurConditions ? 'true' : 'false'}
            />
            J'accepte les conditions d'utilisation et la politique de
            confidentialité de Reachly.
          </label>
          {erreurConditions && (
            <p id="conditions-erreur" role="alert">
              {erreurConditions}
            </p>
          )}
        </div>

        <button type="submit" disabled={enCours} aria-busy={enCours}>
          {enCours ? 'Création en cours…' : 'Créer mon compte'}
        </button>
      </form>
    </main>
  )
}
