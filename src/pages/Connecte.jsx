import BoutonDeconnexion from '../components/BoutonDeconnexion.jsx'

export default function Connecte({ onDeconnexionReussie }) {
  return (
    <main>
      <p role="status">Vous êtes connecté·e.</p>
      <BoutonDeconnexion onDeconnecte={onDeconnexionReussie} />
    </main>
  )
}
