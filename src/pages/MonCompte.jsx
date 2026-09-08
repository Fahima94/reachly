import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { PASSWORD_RULES, passwordRespecteLesRegles } from '../lib/passwordRules.js'
import BoutonAfficherMotDePasse from '../components/BoutonAfficherMotDePasse.jsx'
import EnteteConnecte from '../components/EnteteConnecte.jsx'

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function MonCompte({ onNaviguer, onDeconnexionReussie, onRetour }) {
  // chargement | erreur | pret
  const [etat, setEtat] = useState('chargement')
  const [userId, setUserId] = useState(null)
  const [emailActuel, setEmailActuel] = useState('')
  const [nomComplet, setNomComplet] = useState('')
  const [initiales, setInitiales] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [avatarEnCours, setAvatarEnCours] = useState(false)
  const [erreurAvatar, setErreurAvatar] = useState('')

  const [nouvelEmail, setNouvelEmail] = useState('')
  const [emailEnCours, setEmailEnCours] = useState(false)
  const [erreurEmail, setErreurEmail] = useState('')
  const [confirmationEmail, setConfirmationEmail] = useState(false)

  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('')
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('')
  const [motDePasseTouched, setMotDePasseTouched] = useState(false)
  const [motDePasseVisible, setMotDePasseVisible] = useState(false)
  const refMotDePasse = useRef(null)
  const [motDePasseEnCours, setMotDePasseEnCours] = useState(false)
  const [erreurMotDePasse, setErreurMotDePasse] = useState('')
  const [confirmationMotDePasseEnvoyee, setConfirmationMotDePasseEnvoyee] = useState(false)

  // `estAnnule` protège contre le double montage de StrictMode en
  // développement — motif déjà utilisé sur les autres écrans de l'app.
  async function charger(estAnnule = () => false) {
    setEtat('chargement')
    try {
      const {
        data: { user },
        error: erreurUser,
      } = await supabase.auth.getUser()
      if (estAnnule()) return
      if (erreurUser || !user) {
        setEtat('erreur')
        return
      }

      const { data: profil, error: erreurProfil } = await supabase
        .from('profiles')
        .select('nom, prenom, avatar_url')
        .eq('id', user.id)
        .maybeSingle()
      if (estAnnule()) return

      if (erreurProfil) {
        setEtat('erreur')
        return
      }

      setUserId(user.id)
      setEmailActuel(user.email ?? '')
      setNomComplet([profil?.prenom, profil?.nom].filter(Boolean).join(' '))
      if (profil?.prenom && profil?.nom) {
        setInitiales(`${profil.prenom[0]}${profil.nom[0]}`.toUpperCase())
      }
      setAvatarUrl(profil?.avatar_url || null)
      setEtat('pret')
    } catch {
      if (estAnnule()) return
      setEtat('erreur')
    }
  }

  useEffect(() => {
    let annule = false
    charger(() => annule)
    return () => {
      annule = true
    }
  }, [])

  // Même logique que la pastille du tableau de bord (Dashboard.jsx) —
  // dupliquée plutôt que partagée, cohérent avec le reste de l'app.
  async function gererChoixAvatar(evenement) {
    const fichier = evenement.target.files?.[0]
    evenement.target.value = ''
    if (!fichier || !userId) return

    setErreurAvatar('')
    setAvatarEnCours(true)
    try {
      const extension = fichier.name.split('.').pop() || 'jpg'
      const chemin = `${userId}/avatar-${Date.now()}.${extension}`

      const { error: erreurUpload } = await supabase.storage
        .from('avatars')
        .upload(chemin, fichier, { contentType: fichier.type })
      if (erreurUpload) {
        setErreurAvatar("L'envoi de la photo a échoué. Vérifiez votre connexion et réessayez.")
        setAvatarEnCours(false)
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(chemin)

      const { error: erreurProfil } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
      if (erreurProfil) {
        setErreurAvatar("L'envoi de la photo a échoué. Vérifiez votre connexion et réessayez.")
        setAvatarEnCours(false)
        return
      }

      setAvatarUrl(publicUrl)
      setAvatarEnCours(false)
    } catch {
      setErreurAvatar("L'envoi de la photo a échoué. Vérifiez votre connexion et réessayez.")
      setAvatarEnCours(false)
    }
  }

  // Changement d'adresse appliqué immédiatement, sans email de confirmation
  // (l'auth V1 fonctionne sans e-mail — décision du 2026-09-03, quota
  // Supabase plafonné). Risque assumé : une faute de frappe change l'email
  // sans vérification préalable.
  async function gererChangementEmail(evenement) {
    evenement.preventDefault()
    setErreurEmail('')
    setConfirmationEmail(false)

    const emailTrim = nouvelEmail.trim()
    if (!emailTrim) {
      setErreurEmail('Renseignez une nouvelle adresse email.')
      return
    }
    if (!EMAIL_FORMAT.test(emailTrim)) {
      setErreurEmail("Cette adresse email n'est pas valide.")
      return
    }
    if (emailTrim === emailActuel) {
      setErreurEmail("C'est déjà votre adresse actuelle.")
      return
    }

    setEmailEnCours(true)
    try {
      const { error } = await supabase.auth.updateUser({ email: emailTrim })
      if (error) {
        if (error.status === 422 || /already registered|already exists/i.test(error.message ?? '')) {
          setErreurEmail('Un compte existe déjà pour cette adresse.')
        } else {
          setErreurEmail("Le changement d'adresse a échoué. Vérifiez votre connexion et réessayez.")
        }
        setEmailEnCours(false)
        return
      }
      setEmailActuel(emailTrim)
      setNouvelEmail('')
      setConfirmationEmail(true)
      setEmailEnCours(false)
    } catch {
      setErreurEmail("Le changement d'adresse a échoué. Vérifiez votre connexion et réessayez.")
      setEmailEnCours(false)
    }
  }

  async function gererChangementMotDePasse(evenement) {
    evenement.preventDefault()
    setErreurMotDePasse('')
    setConfirmationMotDePasseEnvoyee(false)
    setMotDePasseTouched(true)

    if (!passwordRespecteLesRegles(nouveauMotDePasse)) {
      setErreurMotDePasse('Le mot de passe ne respecte pas les règles ci-dessous.')
      return
    }
    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setErreurMotDePasse('Les deux mots de passe ne correspondent pas.')
      return
    }

    setMotDePasseEnCours(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: nouveauMotDePasse })
      if (error) {
        setErreurMotDePasse(
          'Le changement de mot de passe a échoué. Vérifiez votre connexion et réessayez.',
        )
        setMotDePasseEnCours(false)
        return
      }
      setNouveauMotDePasse('')
      setConfirmationMotDePasse('')
      setMotDePasseTouched(false)
      setConfirmationMotDePasseEnvoyee(true)
      setMotDePasseEnCours(false)
    } catch {
      setErreurMotDePasse(
        'Le changement de mot de passe a échoué. Vérifiez votre connexion et réessayez.',
      )
      setMotDePasseEnCours(false)
    }
  }

  return (
    <main>
      <EnteteConnecte onNaviguer={onNaviguer} onDeconnexionReussie={onDeconnexionReussie} />
      <header>
        <h1>Mon compte</h1>
        <button type="button" onClick={onRetour}>
          Retour au tableau de bord
        </button>
      </header>

      {etat === 'chargement' && <p role="status">Chargement de votre compte…</p>}

      {etat === 'erreur' && (
        <div>
          <p role="alert" className="erreur-globale">
            Impossible de récupérer votre compte. Vérifiez votre connexion et réessayez.
          </p>
          <button type="button" onClick={() => charger()}>
            Réessayer
          </button>
        </div>
      )}

      {etat === 'pret' && (
        <>
          <section>
            <h2>Photo de profil</h2>
            <div className="conteneur-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="pastille-profil" />
              ) : (
                initiales && (
                  <span className="pastille-profil" aria-hidden="true">
                    {initiales}
                  </span>
                )
              )}
              <label className="bouton-ajout-avatar">
                <span className="visually-hidden">Changer ma photo de profil</span>
                <span aria-hidden="true">{avatarEnCours ? '…' : '+'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={gererChoixAvatar}
                  disabled={avatarEnCours}
                  className="visually-hidden"
                />
              </label>
            </div>
            {erreurAvatar && <p role="alert">{erreurAvatar}</p>}
          </section>

          <section>
            <h2>Identité</h2>
            <p>{nomComplet || '—'}</p>
            <p className="meta-discrete">
              Le nom et le prénom se modifient depuis l'onboarding, pas ici.
            </p>
          </section>

          <section>
            <h2>Adresse email</h2>
            <p className="meta-discrete">Adresse actuelle : {emailActuel}</p>
            <form onSubmit={gererChangementEmail} noValidate>
              {erreurEmail && <p role="alert">{erreurEmail}</p>}
              {confirmationEmail && <p role="status">Adresse email mise à jour.</p>}
              <div>
                <label htmlFor="nouvel-email">Nouvelle adresse email</label>
                <input
                  id="nouvel-email"
                  type="email"
                  autoComplete="email"
                  value={nouvelEmail}
                  onChange={(e) => setNouvelEmail(e.target.value)}
                />
              </div>
              <button type="submit" disabled={emailEnCours} aria-busy={emailEnCours}>
                {emailEnCours ? 'Changement en cours…' : 'Changer mon adresse email'}
              </button>
            </form>
          </section>

          <section>
            <h2>Mot de passe</h2>
            <form onSubmit={gererChangementMotDePasse} noValidate>
              {erreurMotDePasse && <p role="alert">{erreurMotDePasse}</p>}
              {confirmationMotDePasseEnvoyee && <p role="status">Mot de passe modifié.</p>}
              <div>
                <label htmlFor="nouveau-mot-de-passe">Nouveau mot de passe</label>
                <div className="champ-mot-de-passe">
                  <input
                    id="nouveau-mot-de-passe"
                    ref={refMotDePasse}
                    type={motDePasseVisible ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={nouveauMotDePasse}
                    onChange={(e) => {
                      setNouveauMotDePasse(e.target.value)
                      setMotDePasseTouched(true)
                    }}
                    aria-describedby="regles-mot-de-passe-compte"
                  />
                  <BoutonAfficherMotDePasse
                    visible={motDePasseVisible}
                    onBasculer={() => {
                      setMotDePasseVisible((v) => !v)
                      refMotDePasse.current?.focus()
                    }}
                  />
                </div>
                {motDePasseTouched && (
                  <ul id="regles-mot-de-passe-compte">
                    {PASSWORD_RULES.map((rule) => {
                      const respectee = rule.test(nouveauMotDePasse)
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
              <div>
                <label htmlFor="confirmation-mot-de-passe">Confirmer le nouveau mot de passe</label>
                <input
                  id="confirmation-mot-de-passe"
                  type={motDePasseVisible ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmationMotDePasse}
                  onChange={(e) => setConfirmationMotDePasse(e.target.value)}
                />
              </div>
              <button type="submit" disabled={motDePasseEnCours} aria-busy={motDePasseEnCours}>
                {motDePasseEnCours ? 'Changement en cours…' : 'Changer mon mot de passe'}
              </button>
            </form>
          </section>
        </>
      )}
    </main>
  )
}
