import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { estAdmin } from '../lib/admin.js'
import LogoReachly from './LogoReachly.jsx'
import BoutonDeconnexion from './BoutonDeconnexion.jsx'

// Barre supérieure des écrans connectés (hors tableau de bord, qui garde sa
// version en propre) : logo à gauche, pastille de profil à droite avec le
// menu de navigation, le changement de photo et « Se déconnecter ».
// `onNaviguer` est la fonction de navigation de l'app (`naviguerVers`) —
// appelée avec le nom de l'écran cible.
export default function EnteteConnecte({ onNaviguer, onDeconnexionReussie }) {
  const [userId, setUserId] = useState(null)
  const [initiales, setInitiales] = useState('')
  const [nomComplet, setNomComplet] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [emailAdmin, setEmailAdmin] = useState(false)
  const [avatarEnCours, setAvatarEnCours] = useState(false)
  const [erreurAvatar, setErreurAvatar] = useState('')
  const [menuOuvert, setMenuOuvert] = useState(false)
  const menuRef = useRef(null)

  // `annule` protège contre le double montage de StrictMode en développement,
  // comme sur les écrans de l'app.
  useEffect(() => {
    let annule = false
    async function charger() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (annule || !user) return

      setUserId(user.id)
      setEmailAdmin(estAdmin(user.email))

      const { data: profil } = await supabase
        .from('profiles')
        .select('prenom, nom, avatar_url')
        .eq('id', user.id)
        .maybeSingle()
      if (annule) return

      setNomComplet([profil?.prenom, profil?.nom].filter(Boolean).join(' '))
      if (profil?.prenom && profil?.nom) {
        setInitiales(`${profil.prenom[0]}${profil.nom[0]}`.toUpperCase())
      }
      setAvatarUrl(profil?.avatar_url || null)
    }
    charger()
    return () => {
      annule = true
    }
  }, [])

  // Photo de profil : chemin `{userId}/avatar-<horodatage>.<ext>` — le premier
  // segment doit correspondre à `auth.uid()` (policies RLS du bucket
  // `avatars`). L'ancienne photo n'est pas supprimée, juste remplacée dans
  // `profiles.avatar_url`.
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

  // Menu du profil : se ferme au clic en dehors ou à Échap (motif identique
  // au tableau de bord).
  useEffect(() => {
    if (!menuOuvert) return

    function gererClicExterieur(evenement) {
      if (!menuRef.current?.contains(evenement.target)) {
        setMenuOuvert(false)
      }
    }
    function gererClavier(evenement) {
      if (evenement.key === 'Escape') setMenuOuvert(false)
    }

    document.addEventListener('mousedown', gererClicExterieur)
    document.addEventListener('keydown', gererClavier)
    return () => {
      document.removeEventListener('mousedown', gererClicExterieur)
      document.removeEventListener('keydown', gererClavier)
    }
  }, [menuOuvert])

  function allerVers(ecran) {
    setMenuOuvert(false)
    onNaviguer(ecran)
  }

  return (
    <>
      <div className="barre-superieure">
        <LogoReachly onNaviguer={() => onNaviguer('accueil')} />
        <div className="profil-entete">
          <div className="conteneur-avatar" ref={menuRef}>
            <button
              type="button"
              className="declencheur-menu-profil"
              onClick={() => setMenuOuvert((ouvert) => !ouvert)}
              aria-haspopup="true"
              aria-expanded={menuOuvert}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="pastille-profil" />
              ) : (
                initiales && (
                  <span className="pastille-profil" aria-hidden="true">
                    {initiales}
                  </span>
                )
              )}
              <span className="visually-hidden">
                Menu du profil{nomComplet ? ` de ${nomComplet}` : ''}
              </span>
            </button>
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
            {menuOuvert && (
              <div className="menu-profil" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="element-menu-profil"
                  onClick={() => allerVers('publications')}
                >
                  Mes publications
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="element-menu-profil"
                  onClick={() => allerVers('preferences')}
                >
                  Mes préférences
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="element-menu-profil"
                  onClick={() => allerVers('compte')}
                >
                  Mon compte
                </button>
                {/* Réservé aux 3 comptes admin (lib/admin.js) — comme au
                    tableau de bord. */}
                {emailAdmin && (
                  <button
                    type="button"
                    role="menuitem"
                    className="element-menu-profil"
                    onClick={() => allerVers('onboarding-identite')}
                  >
                    Relancer l'onboarding
                  </button>
                )}
              </div>
            )}
          </div>
          <BoutonDeconnexion onDeconnecte={onDeconnexionReussie} className="bouton-deconnexion" />
        </div>
      </div>
      {erreurAvatar && <p role="alert">{erreurAvatar}</p>}
    </>
  )
}
