import { useState } from 'react'
import Inscription from './pages/Inscription.jsx'
import Connexion from './pages/Connexion.jsx'

export default function App() {
  const [ecran, setEcran] = useState('inscription')

  if (ecran === 'connexion') {
    return <Connexion onAllerInscription={() => setEcran('inscription')} />
  }
  return <Inscription onAllerConnexion={() => setEcran('connexion')} />
}
