import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'
import Inscription from './pages/Inscription.jsx'
import Connexion from './pages/Connexion.jsx'
import DemandeReinitialisation from './pages/DemandeReinitialisation.jsx'
import NouveauMotDePasse from './pages/NouveauMotDePasse.jsx'
import Connecte from './pages/Connecte.jsx'
import Identite from './pages/onboarding/Identite.jsx'
import MetiersSecteurs from './pages/onboarding/MetiersSecteurs.jsx'
import CategoriesSources from './pages/onboarding/CategoriesSources.jsx'
import Tonalite from './pages/onboarding/Tonalite.jsx'
import LinkedinPosts from './pages/onboarding/LinkedinPosts.jsx'

function LienExpire({ onRefaireDemande }) {
  return (
    <main>
      <p role="alert">Ce lien a expiré ou a déjà été utilisé.</p>
      <p>
        <button type="button" onClick={onRefaireDemande}>
          Refaire une demande
        </button>
      </p>
    </main>
  )
}

export default function App() {
  const [ecran, setEcran] = useState('inscription')

  useEffect(() => {
    // Un lien (récupération ou confirmation d'inscription) expiré ou déjà
    // utilisé revient avec une erreur dans le fragment d'URL plutôt que
    // d'établir une session.
    const hash = window.location.hash
    // Un clic sur le lien de confirmation d'inscription revient avec
    // "type=signup" dans le fragment ; on le note avant que l'URL soit
    // nettoyée, pour savoir comment réagir au SIGNED_IN qui va suivre.
    const estConfirmationInscription = hash.includes('type=signup')

    if (hash.includes('error=')) {
      setEcran('lien-expire')
      window.history.replaceState(null, '', window.location.pathname)
    }

    const { data: abonnement } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setEcran('nouveau-mot-de-passe')
      }
      // Ne redirige vers l'onboarding que pour un retour de lien de
      // confirmation — une connexion classique (Connexion.jsx) déclenche
      // aussi SIGNED_IN et gère déjà son propre écran.
      if (event === 'SIGNED_IN' && estConfirmationInscription) {
        setEcran('onboarding-identite')
      }
    })

    return () => abonnement.subscription.unsubscribe()
  }, [])

  if (ecran === 'connexion') {
    return (
      <Connexion
        onAllerInscription={() => setEcran('inscription')}
        onMotDePasseOublie={() => setEcran('demande-reinitialisation')}
        onDeconnexionReussie={() => setEcran('connexion')}
      />
    )
  }
  if (ecran === 'demande-reinitialisation') {
    return <DemandeReinitialisation onAllerConnexion={() => setEcran('connexion')} />
  }
  if (ecran === 'nouveau-mot-de-passe') {
    return <NouveauMotDePasse onRefaireDemande={() => setEcran('demande-reinitialisation')} />
  }
  if (ecran === 'lien-expire') {
    return <LienExpire onRefaireDemande={() => setEcran('demande-reinitialisation')} />
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
    return <Connecte onDeconnexionReussie={() => setEcran('connexion')} />
  }
  return (
    <Inscription
      onAllerConnexion={() => setEcran('connexion')}
      onInscriptionReussie={() => setEcran('onboarding-identite')}
    />
  )
}
