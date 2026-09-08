import { useCallback, useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'
import Accueil from './pages/Accueil.jsx'
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

  // Navigation dans l'historique du navigateur (pas d'URL par écran, juste
  // l'entrée d'historique) : sans ça, chaque changement d'écran est un simple
  // changement d'état React, invisible pour le navigateur — le bouton
  // "Précédent" saute directement à ce qu'il y avait avant l'ouverture de
  // l'app plutôt que de revenir à l'écran précédent. `remplacer` (au lieu
  // d'empiler) sert aux transitions qu'on ne veut pas retrouver au clic sur
  // "Précédent" : la toute première résolution de session, et la
  // déconnexion (revenir en arrière ne doit pas ramener sur un écran
  // protégé après un logout).
  const naviguerVers = useCallback((ecranCible, { remplacer = false } = {}) => {
    setEcran(ecranCible)
    if (remplacer) {
      window.history.replaceState({ ecran: ecranCible }, '')
    } else {
      window.history.pushState({ ecran: ecranCible }, '')
    }
  }, [])

  useEffect(() => {
    function gererPopState(evenement) {
      if (evenement.state?.ecran) {
        setEcran(evenement.state.ecran)
      }
    }
    window.addEventListener('popstate', gererPopState)
    return () => window.removeEventListener('popstate', gererPopState)
  }, [])

  // Ticket 02 (amendement) : une session déjà valide (rechargement de page,
  // nouvel onglet) mène directement au tableau de bord, sans repasser par un
  // formulaire. `estAnnule` protège contre le double montage de StrictMode
  // en développement, comme sur les autres écrans de l'app.
  // Ticket 16 : sans session (ou si l'état n'a pas pu être déterminé), le
  // visiteur arrive sur la page d'accueil publique, pas sur le formulaire.
  useEffect(() => {
    let annule = false
    async function verifierSession() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (annule) return
        if (error) {
          naviguerVers('accueil', { remplacer: true })
          return
        }
        naviguerVers(data.session ? 'connecte' : 'accueil', { remplacer: true })
      } catch {
        if (annule) return
        naviguerVers('accueil', { remplacer: true })
      }
    }
    verifierSession()
    return () => {
      annule = true
    }
  }, [naviguerVers])

  if (ecran === null) {
    return (
      <main>
        <p role="status">Chargement…</p>
      </main>
    )
  }

  // Ticket 16 (amendement) : le logo Reachly ramène toujours à l'accueil,
  // sur tous les écrans.
  const allerAccueil = () => naviguerVers('accueil')

  if (ecran === 'accueil') {
    return (
      <Accueil
        onAllerAccueil={allerAccueil}
        onAllerConnexion={() => naviguerVers('connexion')}
        onAllerInscription={() => naviguerVers('inscription')}
      />
    )
  }
  if (ecran === 'inscription') {
    return (
      <Inscription
        onAllerAccueil={allerAccueil}
        onChangerMode={naviguerVers}
        onInscriptionReussie={() => naviguerVers('onboarding-identite')}
      />
    )
  }
  if (ecran === 'onboarding-identite') {
    return (
      <Identite
        onAllerAccueil={allerAccueil}
        onEtapeSuivante={() => naviguerVers('onboarding-categories-sources')}
      />
    )
  }
  // Catégories avant Métiers/secteurs : c'est ce qui sert vraiment au
  // classement du tableau de bord (ticket 11), les métiers/secteurs restent
  // facultatifs.
  if (ecran === 'onboarding-categories-sources') {
    return (
      <CategoriesSources
        onAllerAccueil={allerAccueil}
        onEtapeSuivante={() => naviguerVers('onboarding-metiers-secteurs')}
      />
    )
  }
  if (ecran === 'onboarding-metiers-secteurs') {
    return (
      <MetiersSecteurs
        onAllerAccueil={allerAccueil}
        onEtapeSuivante={() => naviguerVers('onboarding-tonalite')}
      />
    )
  }
  if (ecran === 'onboarding-tonalite') {
    return (
      <Tonalite
        onAllerAccueil={allerAccueil}
        onEtapeSuivante={() => naviguerVers('onboarding-linkedin-posts')}
      />
    )
  }
  if (ecran === 'onboarding-linkedin-posts') {
    return (
      <LinkedinPosts
        onAllerAccueil={allerAccueil}
        onEtapeSuivante={() => naviguerVers('connecte')}
      />
    )
  }
  if (ecran === 'preferences') {
    return <Preferences onAllerAccueil={allerAccueil} onRetour={() => naviguerVers('connecte')} />
  }
  if (ecran === 'admin') {
    return <Admin onAllerAccueil={allerAccueil} onRetour={() => naviguerVers('connecte')} />
  }
  if (ecran === 'publications') {
    return (
      <MesPublications onAllerAccueil={allerAccueil} onRetour={() => naviguerVers('connecte')} />
    )
  }
  if (ecran === 'compte') {
    return <MonCompte onAllerAccueil={allerAccueil} onRetour={() => naviguerVers('connecte')} />
  }
  if (ecran === 'connecte') {
    return (
      <Dashboard
        onAllerAccueil={allerAccueil}
        onDeconnexionReussie={() => naviguerVers('connexion', { remplacer: true })}
        onRelancerOnboarding={() => naviguerVers('onboarding-identite')}
        onModifierPreferences={() => naviguerVers('preferences')}
        onOuvrirAdmin={() => naviguerVers('admin')}
        onOuvrirPublications={() => naviguerVers('publications')}
        onOuvrirCompte={() => naviguerVers('compte')}
      />
    )
  }
  // Par défaut (ecran === 'connexion', ou toute valeur imprévue) : écran de
  // connexion — voir ticket 02.
  return (
    <Connexion
      onAllerAccueil={allerAccueil}
      onChangerMode={naviguerVers}
      onDeconnexionReussie={() => naviguerVers('connexion', { remplacer: true })}
      onRelancerOnboarding={() => naviguerVers('onboarding-identite')}
    />
  )
}
