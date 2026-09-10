import { useEffect, useRef } from 'react'

// Confirmation après "Publier" : ouvre la fenêtre de composition LinkedIn
// pré-attachée à l'article source si on l'a, sinon le profil LinkedIn de la
// personne, sinon invite à le renseigner. Jamais d'appel à l'API LinkedIn —
// la personne colle le texte déjà copié et publie elle-même. Partagé entre
// GenerationPost.jsx (tableau de bord) et MesPublications.jsx.
export default function ModaleConfirmationPublication({
  lienComposition,
  lienLinkedin,
  copieReussie,
  onFermer,
  onOuvrirPreferences,
  elementDeclencheur,
}) {
  const dialogRef = useRef(null)
  const boutonPrincipalRef = useRef(null)

  useEffect(() => {
    // Ne pas se fier à `document.activeElement` ici : le bouton "Publier" est
    // désactivé (`disabled`) au moment même où l'action démarre, avant que
    // cette modale ne monte — un élément désactivé perd le focus (le
    // navigateur le renvoie sur `<body>`), donc `document.activeElement`
    // serait déjà faux à cet instant. On restaure plutôt sur une vraie
    // référence au bouton déclencheur, transmise par le parent.
    boutonPrincipalRef.current?.focus()

    function gererClavier(evenement) {
      if (evenement.key === 'Escape') {
        onFermer()
        return
      }
      if (evenement.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll('button, a[href]')
        if (!focusables || focusables.length === 0) return
        const premier = focusables[0]
        const dernier = focusables[focusables.length - 1]
        if (evenement.shiftKey && document.activeElement === premier) {
          evenement.preventDefault()
          dernier.focus()
        } else if (!evenement.shiftKey && document.activeElement === dernier) {
          evenement.preventDefault()
          premier.focus()
        }
      }
    }

    document.addEventListener('keydown', gererClavier)
    return () => {
      document.removeEventListener('keydown', gererClavier)
      elementDeclencheur?.current?.focus()
    }
  }, [onFermer, elementDeclencheur])

  return (
    <div className="fond-modale">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-confirmation-publication"
        className="modale"
        ref={dialogRef}
      >
        <h2 id="titre-confirmation-publication">Post publié</h2>
        <p role="status">
          Votre post est enregistré{copieReussie ? ' et copié dans le presse-papiers.' : '.'}
        </p>
        {!copieReussie && (
          <p role="alert">
            La copie automatique a échoué — sélectionnez et copiez le texte manuellement.
          </p>
        )}
        {lienComposition ? (
          <>
            <p>
              <a
                ref={boutonPrincipalRef}
                href={lienComposition}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ouvrir LinkedIn (fenêtre de publication)
              </a>
            </p>
            <p className="meta-discrete">
              Collez le texte copié dans le champ de commentaire, puis publiez vous-même —
              rien n'est publié automatiquement.
            </p>
          </>
        ) : lienLinkedin ? (
          <p>
            <a ref={boutonPrincipalRef} href={lienLinkedin} target="_blank" rel="noopener noreferrer">
              Ouvrir LinkedIn
            </a>
          </p>
        ) : (
          <p>
            <button type="button" ref={boutonPrincipalRef} onClick={onOuvrirPreferences}>
              Renseigner mon LinkedIn
            </button>
          </p>
        )}
        <button type="button" onClick={onFermer}>
          Fermer
        </button>
      </div>
    </div>
  )
}
