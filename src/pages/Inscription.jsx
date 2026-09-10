import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { PASSWORD_RULES, passwordRespecteLesRegles } from '../lib/passwordRules.js'
import BasculeConnexionInscription from '../components/BasculeConnexionInscription.jsx'
import BoutonAfficherMotDePasse from '../components/BoutonAfficherMotDePasse.jsx'
import LogoReachly from '../components/LogoReachly.jsx'

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function IconeLinkedin() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  )
}

export default function Inscription({ onAllerAccueil, onChangerMode, onInscriptionReussie }) {
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

  const [erreurLinkedin, setErreurLinkedin] = useState('')

  const enCours = statut === 'chargement'

  // LinkedIn (OIDC, via Supabase) redirige le navigateur vers LinkedIn puis
  // revient sur l'app avec une session déjà établie — pas de suite à gérer
  // ici en cas de succès. Le consentement CGU (case ci-dessus, propre à ce
  // formulaire) est redemandé après coup pour ce parcours, sur un écran
  // dédié (App.jsx détecte la session LinkedIn sans consentement encore
  // enregistré).
  async function gererConnexionLinkedin() {
    setErreurLinkedin('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      setErreurLinkedin('La connexion via LinkedIn a échoué. Vérifiez votre connexion et réessayez.')
    }
  }

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
      <LogoReachly onNaviguer={onAllerAccueil} />
      <BasculeConnexionInscription modeActif="inscription" onChangerMode={onChangerMode} />
      <h1>Créer un compte</h1>

      {erreurLinkedin && (
        <p role="alert" className="erreur-globale">
          {erreurLinkedin}
        </p>
      )}
      <button type="button" className="bouton-linkedin" onClick={gererConnexionLinkedin}>
        <IconeLinkedin />
        Se connecter avec LinkedIn
      </button>

      <p className="separateur-ou" role="separator">
        ou
      </p>

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
            J'accepte les{' '}
            <a href="/conditions-utilisation" target="_blank" rel="noopener noreferrer">
              conditions d'utilisation
            </a>{' '}
            et la{' '}
            <a href="/politique-confidentialite" target="_blank" rel="noopener noreferrer">
              politique de confidentialité
            </a>{' '}
            de Reachly.
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

      <p className="pied-de-page-legal">
        <a href="/conditions-utilisation" target="_blank" rel="noopener noreferrer">
          Conditions d'utilisation
        </a>
        {' · '}
        <a href="/politique-confidentialite" target="_blank" rel="noopener noreferrer">
          Politique de confidentialité
        </a>
      </p>
    </main>
  )
}
