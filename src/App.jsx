import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'
import Inscription from './pages/Inscription.jsx'
import Connexion from './pages/Connexion.jsx'
import DemandeReinitialisation from './pages/DemandeReinitialisation.jsx'
import NouveauMotDePasse from './pages/NouveauMotDePasse.jsx'

function LienExpire({ onRefaireDemande }) {
  return (
    <main>
      <p role="alert">Ce lien de réinitialisation a expiré ou a déjà été utilisé.</p>
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
    // Un lien de récupération expiré ou déjà utilisé revient avec une erreur
    // dans le fragment d'URL plutôt que d'établir une session.
    if (window.location.hash.includes('error=')) {
      setEcran('lien-expire')
      window.history.replaceState(null, '', window.location.pathname)
    }

    const { data: abonnement } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setEcran('nouveau-mot-de-passe')
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
  return (
    <Inscription
      onAllerConnexion={() => setEcran('connexion')}
      onDeconnexionReussie={() => setEcran('connexion')}
    />
  )
}
