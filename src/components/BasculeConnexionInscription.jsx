// Bascule partagée entre les écrans Connexion et Inscription (ticket 01/02,
// amendement) : deux onglets en tête de la carte plutôt qu'un lien texte
// discret, pour qu'on distingue les deux écrans en un coup d'œil. Pas de
// rôle ARIA "tablist"/"tab" complet (qui exigerait une navigation au clavier
// par flèches) : `aria-current` suffit ici, chaque onglet reste un bouton
// standard, tabulable normalement.
export default function BasculeConnexionInscription({ modeActif, onChangerMode }) {
  return (
    <div className="bascule-connexion-inscription">
      <button
        type="button"
        aria-current={modeActif === 'connexion' ? 'true' : undefined}
        onClick={() => onChangerMode('connexion')}
      >
        Se connecter
      </button>
      <button
        type="button"
        aria-current={modeActif === 'inscription' ? 'true' : undefined}
        onClick={() => onChangerMode('inscription')}
      >
        Créer un compte
      </button>
    </div>
  )
}
