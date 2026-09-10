import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import ProgressionOnboarding from '../../components/ProgressionOnboarding.jsx'
import EnteteConnecte from '../../components/EnteteConnecte.jsx'

export default function Identite({ onNaviguer, onDeconnexionReussie, onEtapeSuivante }) {
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [avatarLinkedin, setAvatarLinkedin] = useState(null)
  const [chargementInitial, setChargementInitial] = useState(true)
  const [erreurChargement, setErreurChargement] = useState('')
  const [statut, setStatut] = useState('idle') // idle | chargement
  const [erreurGlobale, setErreurGlobale] = useState('')
  const [erreurPrenom, setErreurPrenom] = useState('')
  const [erreurNom, setErreurNom] = useState('')

  const enCours = statut === 'chargement'

  // `estAnnule` protège contre le double montage de StrictMode en
  // développement : si ce chargement a été annulé (montage suivant déjà en
  // cours), on n'écrase pas un état plus frais avec une réponse en retard.
  async function chargerProfil(estAnnule = () => false) {
    setErreurChargement('')
    setChargementInitial(true)
    try {
      const {
        data: { user },
        error: erreurUtilisateur,
      } = await supabase.auth.getUser()
      if (estAnnule()) return

      if (erreurUtilisateur || !user) {
        setErreurChargement('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
        setChargementInitial(false)
        return
      }

      // Pré-remplissage : lit l'état déjà en base (relance de l'onboarding).
      // Un premier onboarding n'a pas encore de ligne profiles → data null.
      const { data, error } = await supabase
        .from('profiles')
        .select('prenom, nom')
        .eq('id', user.id)
        .maybeSingle()
      if (estAnnule()) return

      if (error) {
        setErreurChargement('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
        setChargementInitial(false)
        return
      }

      if (data) {
        setPrenom(data.prenom ?? '')
        setNom(data.nom ?? '')
      } else {
        // Premier onboarding, aucune ligne profiles : la connexion via
        // LinkedIn (OIDC) fournit parfois prénom/nom/photo dans les
        // métadonnées utilisateur — pré-remplissage, toujours modifiable
        // (LinkedIn peut renvoyer un nom tronqué selon les réglages de
        // confidentialité de la personne, ex. « B. » au lieu du nom complet).
        // `avatarLinkedin` n'est utilisé qu'ici (jamais sur une relance) —
        // condition suffisante pour ne jamais écraser une photo déjà
        // uploadée manuellement (voir gererValidation).
        const metadonnees = user.user_metadata ?? {}
        if (metadonnees.given_name) setPrenom(metadonnees.given_name)
        if (metadonnees.family_name) setNom(metadonnees.family_name)
        if (metadonnees.picture) setAvatarLinkedin(metadonnees.picture)
      }
      setChargementInitial(false)
    } catch {
      if (estAnnule()) return
      setErreurChargement('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
      setChargementInitial(false)
    }
  }

  useEffect(() => {
    let annule = false
    chargerProfil(() => annule)
    return () => {
      annule = true
    }
  }, [])

  async function gererValidation(evenement) {
    evenement.preventDefault()
    setErreurGlobale('')
    setErreurPrenom('')
    setErreurNom('')

    // Champ vide
    if (!prenom.trim() || !nom.trim()) {
      if (!prenom.trim()) setErreurPrenom('Renseignez votre prénom.')
      if (!nom.trim()) setErreurNom('Renseignez votre nom.')
      return
    }

    setStatut('chargement')
    try {
      const {
        data: { user },
        error: erreurUtilisateur,
      } = await supabase.auth.getUser()

      if (erreurUtilisateur || !user) {
        setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
        setStatut('idle')
        return
      }

      // Première écriture dans profiles pour cette personne : upsert (pas de
      // ligne existante), on en profite pour y copier l'email déjà connu.
      const correctifs = {
        id: user.id,
        email: user.email,
        prenom: prenom.trim(),
        nom: nom.trim(),
      }
      // `avatar_url` seulement si LinkedIn en a fourni une à l'instant (voir
      // chargerProfil) — jamais inclus sinon, pour ne jamais écraser une
      // photo déjà choisie manuellement (Dashboard.jsx / MonCompte.jsx) sur
      // une relance de l'onboarding.
      if (avatarLinkedin) {
        correctifs.avatar_url = avatarLinkedin
      }

      const { error } = await supabase.from('profiles').upsert(correctifs)

      if (error) {
        setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
        setStatut('idle')
        return
      }

      onEtapeSuivante()
    } catch {
      setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
      setStatut('idle')
    }
  }

  return (
    <main>
      <EnteteConnecte onNaviguer={onNaviguer} onDeconnexionReussie={onDeconnexionReussie} />
      <ProgressionOnboarding etape={1} total={5} />
      <p>Ces informations nous aident à mieux orienter votre veille et vos posts.</p>
      <h1>Comment vous appelez-vous ?</h1>

      {chargementInitial && (
        <p role="status">Chargement de vos réponses…</p>
      )}

      {!chargementInitial && erreurChargement && (
        <div>
          <p role="alert" className="erreur-globale">
            {erreurChargement}
          </p>
          <button type="button" onClick={() => chargerProfil()}>
            Réessayer
          </button>
        </div>
      )}

      {!chargementInitial && !erreurChargement && (
        <form onSubmit={gererValidation} noValidate>
          {erreurGlobale && (
            <p role="alert" className="erreur-globale">
              {erreurGlobale}
            </p>
          )}

          <div>
            <label htmlFor="prenom">Prénom</label>
            <input
              id="prenom"
              name="prenom"
              type="text"
              autoComplete="given-name"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              aria-describedby={erreurPrenom ? 'prenom-erreur' : undefined}
              aria-invalid={erreurPrenom ? 'true' : 'false'}
            />
            {erreurPrenom && (
              <p id="prenom-erreur" role="alert">
                {erreurPrenom}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="nom">Nom</label>
            <input
              id="nom"
              name="nom"
              type="text"
              autoComplete="family-name"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              aria-describedby={erreurNom ? 'nom-erreur' : undefined}
              aria-invalid={erreurNom ? 'true' : 'false'}
            />
            {erreurNom && (
              <p id="nom-erreur" role="alert">
                {erreurNom}
              </p>
            )}
          </div>

          <button type="submit" disabled={enCours} aria-busy={enCours}>
            {enCours ? 'Enregistrement en cours…' : 'Suivant'}
          </button>
        </form>
      )}
    </main>
  )
}
