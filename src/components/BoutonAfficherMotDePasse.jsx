// Commande afficher / masquer le mot de passe, placée à l'intérieur du champ
// (cf. ticket 01, amendement 2026-09-07). Vrai <button type="button"> :
// `aria-pressed` porte l'état, `aria-label` le libellé complet (jamais
// l'icône seule). L'icône bascule œil / œil barré — l'information n'est
// donc pas portée par la seule couleur.
export default function BoutonAfficherMotDePasse({ visible, onBasculer }) {
  return (
    <button
      type="button"
      className="bouton-afficher-mot-de-passe"
      onClick={onBasculer}
      aria-pressed={visible}
      aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
    >
      <IconeOeil barre={visible} />
    </button>
  )
}

function IconeOeil({ barre }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.25" fill="none" stroke="currentColor" strokeWidth="2" />
      {barre && (
        <line
          x1="4"
          y1="20"
          x2="20"
          y2="4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}
