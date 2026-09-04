import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'

function ModaleConfirmationPublication({ lienLinkedin, copieReussie, onFermer, onOuvrirPreferences }) {
  const dialogRef = useRef(null)
  const boutonPrincipalRef = useRef(null)

  useEffect(() => {
    const elementPrecedent = document.activeElement
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
      if (elementPrecedent instanceof HTMLElement) elementPrecedent.focus()
    }
  }, [onFermer])

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="titre-confirmation-publication" ref={dialogRef}>
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
  )
}

export default function GenerationPost({ sujetId, userId, tonaliteDefinie, onModifierPreferences }) {
  // idle | manque-tonalite | chargement | pret | erreur
  const [etat, setEtat] = useState('idle')
  const [texte, setTexte] = useState('')
  const [publicationId, setPublicationId] = useState(null)
  const [copieConfirmee, setCopieConfirmee] = useState(false)
  const [erreurCopie, setErreurCopie] = useState(false)

  // idle | enregistrer | publier
  const [actionEnCours, setActionEnCours] = useState(null)
  const [erreurAction, setErreurAction] = useState('')
  const [confirmationEnregistre, setConfirmationEnregistre] = useState(false)
  const [modaleOuverte, setModaleOuverte] = useState(false)
  const [lienLinkedin, setLienLinkedin] = useState(null)
  const [copieModaleReussie, setCopieModaleReussie] = useState(true)

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

  async function gererCopie() {
    setErreurCopie(false)
    try {
      await navigator.clipboard.writeText(texte)
      setCopieConfirmee(true)
      setTimeout(() => setCopieConfirmee(false), 3000)
    } catch {
      setErreurCopie(true)
    }
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
      <button type="button" onClick={gererClicGenerer}>
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
      <button type="button" disabled aria-busy="true">
        Génération en cours…
      </button>
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
      <textarea id={idTexte} value={texte} onChange={(e) => setTexte(e.target.value)} rows={6} />

      {erreurAction && <p role="alert">{erreurAction}</p>}

      <p>
        <button type="button" onClick={gererCopie}>
          Copier
        </button>
        {copieConfirmee && <span role="status"> Copié !</span>}
        {erreurCopie && (
          <span role="alert"> La copie a échoué — sélectionnez et copiez le texte manuellement.</span>
        )}
      </p>

      <p>
        <button type="button" onClick={() => sauvegarder('Enregistré')} disabled={actionEnCoursQuelconque}>
          {actionEnCours === 'enregistrer' ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {confirmationEnregistre && <span role="status"> Enregistré !</span>}
      </p>

      <p>
        <button type="button" onClick={() => sauvegarder('Publié')} disabled={actionEnCoursQuelconque}>
          {actionEnCours === 'publier' ? 'Publication…' : 'Publier'}
        </button>
      </p>

      {modaleOuverte && (
        <ModaleConfirmationPublication
          lienLinkedin={lienLinkedin}
          copieReussie={copieModaleReussie}
          onFermer={() => setModaleOuverte(false)}
          onOuvrirPreferences={onModifierPreferences}
        />
      )}
    </div>
  )
}
