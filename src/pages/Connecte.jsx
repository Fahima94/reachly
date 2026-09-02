import BoutonDeconnexion from '../components/BoutonDeconnexion.jsx'

export default function Connecte({ onDeconnexionReussie, onRelancerOnboarding }) {
  return (
    <main>
      <p role="status">Vous êtes connecté·e.</p>
      <BoutonDeconnexion onDeconnecte={onDeconnexionReussie} />
      <p>
        <button type="button" onClick={onRelancerOnboarding}>
          Relancer l'onboarding
        </button>
      </p>
    </main>
  )
}
