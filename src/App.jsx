import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'
import Inscription from './pages/Inscription.jsx'
import Connexion from './pages/Connexion.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Preferences from './pages/Preferences.jsx'
import Admin from './pages/Admin.jsx'
import MesPublications from './pages/MesPublications.jsx'
import MonCompte from './pages/MonCompte.jsx'
import Identite from './pages/onboarding/Identite.jsx'
import MetiersSecteurs from './pages/onboarding/MetiersSecteurs.jsx'
import CategoriesSources from './pages/onboarding/CategoriesSources.jsx'
import Tonalite from './pages/onboarding/Tonalite.jsx'
import LinkedinPosts from './pages/onboarding/LinkedinPosts.jsx'

export default function App() {
  // `null` : vérification de la session en cours, rien n'est encore décidé.
  const [ecran, setEcran] = useState(null)

  // Ticket 02 (amendement) : une session déjà valide (rechargement de page,
  // nouvel onglet) mène directement au tableau de bord, sans repasser par un
  // formulaire. `estAnnule` protège contre le double montage de StrictMode
  // en développement, comme sur les autres écrans de l'app.
  useEffect(() => {
    let annule = false
    async function verifierSession() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (annule) return
        if (error) {
          setEcran('connexion')
          return
        }
        setEcran(data.session ? 'connecte' : 'connexion')
      } catch {
        if (annule) return
        setEcran('connexion')
      }
    }
    verifierSession()
    return () => {
      annule = true
    }
  }, [])

  if (ecran === null) {
    return (
      <main>
        <p role="status">Chargement…</p>
      </main>
    )
  }

  if (ecran === 'inscription') {
    return (
      <Inscription
        onChangerMode={setEcran}
        onInscriptionReussie={() => setEcran('onboarding-identite')}
      />
    )
  }
  if (ecran === 'onboarding-identite') {
    return <Identite onEtapeSuivante={() => setEcran('onboarding-categories-sources')} />
  }
  // Catégories avant Métiers/secteurs : c'est ce qui sert vraiment au
  // classement du tableau de bord (ticket 11), les métiers/secteurs restent
  // facultatifs.
  if (ecran === 'onboarding-categories-sources') {
    return <CategoriesSources onEtapeSuivante={() => setEcran('onboarding-metiers-secteurs')} />
  }
  if (ecran === 'onboarding-metiers-secteurs') {
    return <MetiersSecteurs onEtapeSuivante={() => setEcran('onboarding-tonalite')} />
  }
  if (ecran === 'onboarding-tonalite') {
    return <Tonalite onEtapeSuivante={() => setEcran('onboarding-linkedin-posts')} />
  }
  if (ecran === 'onboarding-linkedin-posts') {
    return <LinkedinPosts onEtapeSuivante={() => setEcran('connecte')} />
  }
  if (ecran === 'preferences') {
    return <Preferences onRetour={() => setEcran('connecte')} />
  }
  if (ecran === 'admin') {
    return <Admin onRetour={() => setEcran('connecte')} />
  }
  if (ecran === 'publications') {
    return <MesPublications onRetour={() => setEcran('connecte')} />
  }
  if (ecran === 'compte') {
    return <MonCompte onRetour={() => setEcran('connecte')} />
  }
  if (ecran === 'connecte') {
    return (
      <Dashboard
        onDeconnexionReussie={() => setEcran('connexion')}
        onRelancerOnboarding={() => setEcran('onboarding-identite')}
        onModifierPreferences={() => setEcran('preferences')}
        onOuvrirAdmin={() => setEcran('admin')}
        onOuvrirPublications={() => setEcran('publications')}
        onOuvrirCompte={() => setEcran('compte')}
      />
    )
  }
  // Par défaut (ecran === 'connexion', ou toute valeur imprévue) : écran de
  // connexion — voir ticket 02.
  return (
    <Connexion
      onChangerMode={setEcran}
      onDeconnexionReussie={() => setEcran('connexion')}
      onRelancerOnboarding={() => setEcran('onboarding-identite')}
    />
  )
}
