import { useEffect, useRef, useState } from 'react'
import LogoReachly from '../components/LogoReachly.jsx'

// Ticket 16. Landing publique : point d'entrée par défaut d'un visiteur non
// connecté. Contenu éditorial fixe, resserré à l'essentiel.

const PROMESSES = [
  {
    titre: 'Veille agrégée & scorée',
    texte:
      'Vos sources sont centralisées et chaque sujet reçoit un score de pertinence calculé par IA, pour ne garder que l’essentiel.',
  },
  {
    titre: 'Post généré dans votre voix',
    texte:
      'Un premier jet personnalisé d’environ 100 mots est rédigé — jamais le style générique d’une IA classique.',
  },
  {
    titre: 'Validation humaine garantie',
    texte:
      'Rien n’est publié sans votre accord. Vous corrigez, vous ajustez la tonalité, vous gardez la main sur vos posts et votre réputation professionnelle.',
  },
]

function preferenceAnimationReduite() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export default function Accueil({ onAllerAccueil, onAllerConnexion, onAllerInscription }) {
  // `prefers-reduced-motion` : pas de lecture automatique, un visuel fixe à la
  // place (cf. direction d'écran, ticket 16).
  const [animationReduite, setAnimationReduite] = useState(preferenceAnimationReduite)
  // La présentation animée est purement illustrative : si elle ne charge pas
  // ou ne peut pas être lue, on la remplace par un aplat neutre — le reste de
  // la page ne dépend pas d'elle.
  const [videoEnEchec, setVideoEnEchec] = useState(false)
  // En plein écran, on affiche les contrôles natifs (le reste du temps la
  // vidéo est décorative, sans contrôle).
  const [videoPleinEcran, setVideoPleinEcran] = useState(false)
  const refVideo = useRef(null)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const surChangement = (evenement) => setAnimationReduite(evenement.matches)
    mq.addEventListener?.('change', surChangement)
    return () => mq.removeEventListener?.('change', surChangement)
  }, [])

  useEffect(() => {
    const surChangement = () =>
      setVideoPleinEcran(document.fullscreenElement === refVideo.current)
    document.addEventListener('fullscreenchange', surChangement)
    return () => document.removeEventListener('fullscreenchange', surChangement)
  }, [])

  // Clic sur l'animation → plein écran (API Fullscreen, avec le repli WebKit
  // pour Safari / iOS). Échec silencieux : la vidéo reste dans son cadre.
  function passerEnPleinEcran() {
    const element = refVideo.current
    if (!element) return
    const demanderPleinEcran =
      element.requestFullscreen ||
      element.webkitRequestFullscreen ||
      element.webkitEnterFullscreen
    try {
      demanderPleinEcran?.call(element)
    } catch {
      /* le navigateur a refusé (geste utilisateur, permissions) — sans effet */
    }
  }

  const afficherVideo = !animationReduite && !videoEnEchec

  return (
    <main className="landing">
      <header className="landing-entete">
        <LogoReachly onNaviguer={onAllerAccueil} />
        <nav className="landing-menu" aria-label="Accès au compte">
          <button type="button" className="lien-menu" onClick={onAllerConnexion}>
            Connexion
          </button>
          <button type="button" onClick={onAllerInscription}>
            Inscription
          </button>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-texte">
          <h1>Être le premier à parler, sans y passer ses nuits.</h1>
          <p className="landing-accroche">
            Reachly agrège votre veille Tech &amp; IA, la note par pertinence et vous
            propose instantanément les 5 sujets les plus chauds, et génère des posts
            dans votre voix, prêts à valider avant publication sur LinkedIn.
          </p>
          <div className="landing-actions">
            <button type="button" className="bouton-primaire" onClick={onAllerInscription}>
              Créer mon compte
            </button>
          </div>
          <ul className="landing-chiffres">
            <li>
              <strong>4h → 10 min</strong>
              de veille quotidienne
            </li>
            <li>
              <strong>5 sujets</strong>
              livrés chaque matin
            </li>
            <li>
              <strong>100 %</strong>
              validé par vous avant publication
            </li>
          </ul>
        </div>

        <div className="landing-hero-media">
          {afficherVideo ? (
            <button
              type="button"
              className="landing-video-bouton"
              onClick={passerEnPleinEcran}
              aria-label="Afficher l’animation en plein écran"
            >
              <video
                ref={refVideo}
                className="landing-video"
                src="/reachly-animation.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                controls={videoPleinEcran}
                aria-hidden="true"
                onError={() => setVideoEnEchec(true)}
              />
            </button>
          ) : (
            <div className="landing-video-repli" aria-hidden="true" />
          )}
        </div>
      </section>

      <section className="landing-promesse" aria-labelledby="promesse-titre">
        <h2 id="promesse-titre">Notre promesse</h2>
        <ul className="landing-promesse-liste">
          {PROMESSES.map((promesse) => (
            <li key={promesse.titre}>
              <h3>{promesse.titre}</h3>
              <p>{promesse.texte}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="landing-cta">
        <h2>Prêt à reprendre le contrôle de votre veille ?</h2>
        <p>
          Créez votre compte en quelques minutes et obtenez votre première
          sélection de sujets instantanément.
        </p>
        <button type="button" className="bouton-primaire" onClick={onAllerInscription}>
          Créer mon compte
        </button>
      </section>
    </main>
  )
}
