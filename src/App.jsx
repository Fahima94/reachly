import { useState } from 'react'
import Inscription from './pages/Inscription.jsx'
import Connexion from './pages/Connexion.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Identite from './pages/onboarding/Identite.jsx'
import MetiersSecteurs from './pages/onboarding/MetiersSecteurs.jsx'
import CategoriesSources from './pages/onboarding/CategoriesSources.jsx'
import Tonalite from './pages/onboarding/Tonalite.jsx'
import LinkedinPosts from './pages/onboarding/LinkedinPosts.jsx'

export default function App() {
  const [ecran, setEcran] = useState('inscription')

  if (ecran === 'connexion') {
    return (
      <Connexion
        onAllerInscription={() => setEcran('inscription')}
        onDeconnexionReussie={() => setEcran('connexion')}
        onRelancerOnboarding={() => setEcran('onboarding-identite')}
      />
    )
  }
  if (ecran === 'onboarding-identite') {
    return <Identite onEtapeSuivante={() => setEcran('onboarding-metiers-secteurs')} />
  }
  if (ecran === 'onboarding-metiers-secteurs') {
    return <MetiersSecteurs onEtapeSuivante={() => setEcran('onboarding-categories-sources')} />
  }
  if (ecran === 'onboarding-categories-sources') {
    return <CategoriesSources onEtapeSuivante={() => setEcran('onboarding-tonalite')} />
  }
  if (ecran === 'onboarding-tonalite') {
    return <Tonalite onEtapeSuivante={() => setEcran('onboarding-linkedin-posts')} />
  }
  if (ecran === 'onboarding-linkedin-posts') {
    return <LinkedinPosts onEtapeSuivante={() => setEcran('connecte')} />
  }
  if (ecran === 'connecte') {
    return (
      <Dashboard
        onDeconnexionReussie={() => setEcran('connexion')}
        onRelancerOnboarding={() => setEcran('onboarding-identite')}
      />
    )
  }
  return (
    <Inscription
      onAllerConnexion={() => setEcran('connexion')}
      onInscriptionReussie={() => setEcran('onboarding-identite')}
    />
  )
}
