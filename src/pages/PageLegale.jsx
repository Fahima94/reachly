import LogoReachly from '../components/LogoReachly.jsx'

// Ticket 15 : contenu juridique rédigé par un humain, jamais généré — tant
// qu'il ne l'est pas, cette page affiche une mention explicite et un moyen
// de contact, jamais une page blanche ou cassée. `version`/`dateMiseAJour`
// restent `null` jusqu'à ce qu'un texte réel soit fourni ; c'est cette
// valeur que l'inscription (ticket 01) devra enregistrer comme version du
// consentement une fois câblée.
const DOCUMENTS = {
  conditions: {
    titre: "Conditions d'utilisation",
    chemin: '/conditions-utilisation',
    version: null,
    dateMiseAJour: null,
    titreAutre: 'Politique de confidentialité',
    cheminAutre: '/politique-confidentialite',
  },
  confidentialite: {
    titre: 'Politique de confidentialité',
    chemin: '/politique-confidentialite',
    version: null,
    dateMiseAJour: null,
    titreAutre: "Conditions d'utilisation",
    cheminAutre: '/conditions-utilisation',
  },
}

export default function PageLegale({ document }) {
  const infos = DOCUMENTS[document]

  return (
    <main>
      <LogoReachly onNaviguer={() => window.location.assign('/')} />
      <h1>{infos.titre}</h1>

      {infos.dateMiseAJour ? (
        <p className="meta-discrete">Dernière mise à jour : {infos.dateMiseAJour}</p>
      ) : (
        <p role="status">
          Ce document est en cours de rédaction et n'est pas encore disponible. Pour toute
          question, contactez-nous à{' '}
          <a href="mailto:contact@reachly.fr">contact@reachly.fr</a>.
        </p>
      )}

      <p>
        <a href={infos.cheminAutre}>Consulter : {infos.titreAutre}</a>
      </p>
    </main>
  )
}
