// Logo Reachly, en tête de chaque écran. Avec `onNaviguer`, il devient un
// bouton qui ramène à la page d'accueil (ticket 16, amendement) ; sans, il
// reste un simple bloc décoratif.
export default function LogoReachly({ onNaviguer }) {
  const contenu = (
    <>
      <span className="logo-reachly-carre" aria-hidden="true">
        R
      </span>
      Reachly
    </>
  )

  if (onNaviguer) {
    return (
      <button
        type="button"
        className="logo-reachly logo-reachly-bouton"
        onClick={onNaviguer}
        aria-label="Reachly — retour à l'accueil"
      >
        {contenu}
      </button>
    )
  }

  return <div className="logo-reachly">{contenu}</div>
}
