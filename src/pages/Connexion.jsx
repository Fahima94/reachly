import { useRef, useState } from 'react'
import { definirSeSouvenir, supabase } from '../lib/supabase.js'
import Dashboard from './Dashboard.jsx'
import Preferences from './Preferences.jsx'
import Admin from './Admin.jsx'
import MesPublications from './MesPublications.jsx'
import BasculeConnexionInscription from '../components/BasculeConnexionInscription.jsx'
import BoutonAfficherMotDePasse from '../components/BoutonAfficherMotDePasse.jsx'
import LogoReachly from '../components/LogoReachly.jsx'

export default function Connexion({
  onChangerMode,
  onDeconnexionReussie,
  onRelancerOnboarding,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [seSouvenir, setSeSouvenir] = useState(true)
  const [motDePasseVisible, setMotDePasseVisible] = useState(false)
  const refMotDePasse = useRef(null)
  const [preferencesOuvertes, setPreferencesOuvertes] = useState(false)
  const [adminOuvert, setAdminOuvert] = useState(false)
  const [publicationsOuvertes, setPublicationsOuvertes] = useState(false)
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
      definirSeSouvenir(seSouvenir)
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

  if (statut === 'succes' && preferencesOuvertes) {
    return <Preferences onRetour={() => setPreferencesOuvertes(false)} />
  }

  if (statut === 'succes' && adminOuvert) {
    return <Admin onRetour={() => setAdminOuvert(false)} />
  }

  if (statut === 'succes' && publicationsOuvertes) {
    return <MesPublications onRetour={() => setPublicationsOuvertes(false)} />
  }

  if (statut === 'succes') {
    return (
      <Dashboard
        onDeconnexionReussie={onDeconnexionReussie}
        onRelancerOnboarding={onRelancerOnboarding}
        onModifierPreferences={() => setPreferencesOuvertes(true)}
        onOuvrirAdmin={() => setAdminOuvert(true)}
        onOuvrirPublications={() => setPublicationsOuvertes(true)}
      />
    )
  }

  return (
    <main>
      <LogoReachly />
      <BasculeConnexionInscription modeActif="connexion" onChangerMode={onChangerMode} />
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
          <div className="champ-mot-de-passe">
            <input
              id="password"
              name="password"
              ref={refMotDePasse}
              type={motDePasseVisible ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby={erreurMotDePasse ? 'password-erreur' : undefined}
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
        </div>

        <div>
          <label htmlFor="se-souvenir">
            <input
              id="se-souvenir"
              type="checkbox"
              checked={seSouvenir}
              onChange={(e) => setSeSouvenir(e.target.checked)}
            />
            Se souvenir de moi
          </label>
        </div>

        <button type="submit" disabled={enCours} aria-busy={enCours}>
          {enCours ? 'Connexion en cours…' : 'Se connecter'}
        </button>
      </form>
    </main>
  )
}
