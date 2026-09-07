import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'

function IconeGeneration() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      aria-hidden="true"
      focusable="false"
      className="icone-generation"
    >
      <path
        d="M12 2a7 7 0 0 0-4 12.74c.6.44 1 1.16 1 1.96V17a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-.3c0-.8.4-1.52 1-1.96A7 7 0 0 0 12 2z"
        fill="currentColor"
      />
      <rect x="9.5" y="19.5" width="5" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="10" y="21.6" width="4" height="1.4" rx="0.7" fill="currentColor" />
    </svg>
  )
}

function ModaleConfirmationPublication({
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
        {lienLinkedin ? (
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

export default function GenerationPost({ sujetId, userId, tonaliteDefinie, onModifierPreferences }) {
  // idle | manque-tonalite | chargement | pret | erreur
  const [etat, setEtat] = useState('idle')
  const [texte, setTexte] = useState('')
  const [publicationId, setPublicationId] = useState(null)

  // idle | enregistrer | publier
  const [actionEnCours, setActionEnCours] = useState(null)
  const [erreurAction, setErreurAction] = useState('')
  const [confirmationEnregistre, setConfirmationEnregistre] = useState(false)
  const [modaleOuverte, setModaleOuverte] = useState(false)
  const [lienLinkedin, setLienLinkedin] = useState(null)
  const [copieModaleReussie, setCopieModaleReussie] = useState(true)
  const boutonPublierRef = useRef(null)
  const texteRef = useRef(null)

  // Le champ suit la longueur du texte plutôt qu'une hauteur fixe (6 lignes
  // quel que soit le contenu) — recalculée à chaque changement, génération
  // initiale comme frappe au clavier.
  useEffect(() => {
    const el = texteRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [texte])

  async function genererPost() {
    setEtat('chargement')
    try {
      const reponse = await fetch(import.meta.env.VITE_N8N_WEBHOOK_GENERATION_POST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, info_id: sujetId }),
      })

      if (!reponse.ok) {
        setEtat('erreur')
        return
      }

      const donnees = await reponse.json()
      if (!donnees?.success || typeof donnees.post !== 'string') {
        setEtat('erreur')
        return
      }

      setTexte(donnees.post)
      setPublicationId(donnees.publication_id ?? null)
      setEtat('pret')
    } catch {
      setEtat('erreur')
    }
  }

  function gererClicGenerer() {
    if (!tonaliteDefinie) {
      setEtat('manque-tonalite')
      return
    }
    genererPost()
  }

  // Enregistre toujours le texte tel qu'affiché à l'écran (avec les
  // modifications éventuelles) — jamais le texte original renvoyé par le
  // webhook, qui n'est plus à jour dès que la personne a retouché le texte.
  async function sauvegarder(nouveauStatut) {
    if (!publicationId) {
      setErreurAction("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
      return
    }

    setErreurAction('')
    setActionEnCours(nouveauStatut === 'Publié' ? 'publier' : 'enregistrer')
    try {
      const correctifs = { contenu: texte, statut: nouveauStatut }
      if (nouveauStatut === 'Publié') {
        correctifs.date_publication = new Date().toISOString().slice(0, 10)
      }

      const { error } = await supabase.from('Publications').update(correctifs).eq('id', publicationId)
      if (error) {
        setErreurAction("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
        setActionEnCours(null)
        return
      }

      if (nouveauStatut === 'Enregistré') {
        setConfirmationEnregistre(true)
        setTimeout(() => setConfirmationEnregistre(false), 3000)
        setActionEnCours(null)
        return
      }

      // Publié : copie dans le presse-papiers puis ouverture de la modale.
      let copieReussie = true
      try {
        await navigator.clipboard.writeText(texte)
      } catch {
        copieReussie = false
      }
      setCopieModaleReussie(copieReussie)

      const { data: profil } = await supabase
        .from('profiles')
        .select('linkedin')
        .eq('id', userId)
        .maybeSingle()
      setLienLinkedin(profil?.linkedin || null)

      setActionEnCours(null)
      setModaleOuverte(true)
    } catch {
      setErreurAction("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
      setActionEnCours(null)
    }
  }

  if (etat === 'idle') {
    return (
      <button type="button" className="bouton-primaire" onClick={gererClicGenerer}>
        Générer un post
      </button>
    )
  }

  if (etat === 'manque-tonalite') {
    return (
      <div>
        <p role="alert">Choisissez d'abord une tonalité pour générer un post.</p>
        <button type="button" onClick={onModifierPreferences}>
          Renseigner mes préférences
        </button>
      </div>
    )
  }

  if (etat === 'chargement') {
    return (
      <p role="status" className="generation-en-cours" aria-busy="true">
        <IconeGeneration />
        Génération en cours…
      </p>
    )
  }

  if (etat === 'erreur') {
    return (
      <div>
        <p role="alert">Impossible de générer le post. Vérifiez votre connexion et réessayez.</p>
        <button type="button" onClick={genererPost}>
          Réessayer
        </button>
      </div>
    )
  }

  const idTexte = `post-genere-${sujetId}`
  const actionEnCoursQuelconque = actionEnCours !== null

  return (
    <div>
      <label htmlFor={idTexte}>Texte du post généré, modifiable</label>
      <textarea
        id={idTexte}
        ref={texteRef}
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        rows={1}
        className="texte-auto-adaptatif"
      />

      {erreurAction && <p role="alert">{erreurAction}</p>}

      <div className="actions-generation-post">
        <button
          type="button"
          ref={boutonPublierRef}
          className="bouton-primaire"
          onClick={() => sauvegarder('Publié')}
          disabled={actionEnCoursQuelconque}
        >
          {actionEnCours === 'publier' ? 'Publication…' : 'Publier'}
        </button>
        <button type="button" onClick={() => sauvegarder('Enregistré')} disabled={actionEnCoursQuelconque}>
          {actionEnCours === 'enregistrer' ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
      {confirmationEnregistre && <p role="status">Enregistré !</p>}

      {modaleOuverte && (
        <ModaleConfirmationPublication
          lienLinkedin={lienLinkedin}
          copieReussie={copieModaleReussie}
          onFermer={() => setModaleOuverte(false)}
          onOuvrirPreferences={onModifierPreferences}
          elementDeclencheur={boutonPublierRef}
        />
      )}
    </div>
  )
}
