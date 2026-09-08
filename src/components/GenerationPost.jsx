import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const VOIX_NARRATIVES = [
  { valeur: 'je_masculin', libelle: 'Je (masculin)' },
  { valeur: 'je_feminin', libelle: 'Je (féminin)' },
  { valeur: 'nous_masculin', libelle: 'Nous (masculin pluriel)' },
  { valeur: 'nous_feminin', libelle: 'Nous (féminin pluriel)' },
  { valeur: 'nous_inclusif', libelle: 'Nous (pluriel inclusif)' },
]

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

function ModaleConfirmationGeneration({
  sujetId,
  tonalites,
  tonaliteSelectionnee,
  onChangerTonalite,
  voixSelectionnee,
  onChangerVoix,
  onModifierPreferences,
  onConfirmer,
  onAnnuler,
  elementDeclencheur,
}) {
  const dialogRef = useRef(null)
  const boutonPrincipalRef = useRef(null)

  useEffect(() => {
    boutonPrincipalRef.current?.focus()

    function gererClavier(evenement) {
      if (evenement.key === 'Escape') {
        onAnnuler()
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
  }, [onAnnuler, elementDeclencheur])

  return (
    <div className="fond-modale">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-confirmation-generation"
        className="modale"
        ref={dialogRef}
      >
        <h2 id="titre-confirmation-generation">Vérifier avant de générer</h2>
        <p className="meta-discrete">
          Valable pour ce post uniquement — ne change pas vos préférences enregistrées.
        </p>
        <div>
          <label htmlFor={`tonalite-generation-${sujetId}`}>Tonalité</label>
          <select
            id={`tonalite-generation-${sujetId}`}
            value={tonaliteSelectionnee ?? ''}
            onChange={(e) => onChangerTonalite(e.target.value)}
          >
            {tonalites.map((t) => (
              <option key={t.id} value={t.id}>
                {t['Visée de la publication']}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`voix-generation-${sujetId}`}>Voix narrative</label>
          <select
            id={`voix-generation-${sujetId}`}
            value={voixSelectionnee ?? ''}
            onChange={(e) => onChangerVoix(e.target.value)}
          >
            {VOIX_NARRATIVES.map((v) => (
              <option key={v.valeur} value={v.valeur}>
                {v.libelle}
              </option>
            ))}
          </select>
        </div>
        <p>
          <button type="button" className="bouton-discret" onClick={onModifierPreferences}>
            Modifier mes préférences par défaut
          </button>
        </p>
        <div className="actions-generation-post">
          <button type="button" ref={boutonPrincipalRef} className="bouton-primaire" onClick={onConfirmer}>
            Tout est ok, générer
          </button>
          <button type="button" onClick={onAnnuler}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GenerationPost({
  sujetId,
  userId,
  tonaliteDefinie,
  tonalites,
  tonaliteId,
  voixCode,
  onModifierPreferences,
}) {
  // idle | manque-tonalite | chargement | pret | erreur
  const [etat, setEtat] = useState('idle')
  const [texte, setTexte] = useState('')
  const [publicationId, setPublicationId] = useState(null)
  // Pré-remplies avec le profil à l'ouverture de la pop up ; modifiables
  // juste pour cette génération (ticket n8n du 2026-09-08 — override
  // ponctuel, n'écrit jamais dans `profiles`).
  const [tonaliteSelectionnee, setTonaliteSelectionnee] = useState(null)
  const [voixSelectionnee, setVoixSelectionnee] = useState('')

  // idle | enregistrer | publier
  const [actionEnCours, setActionEnCours] = useState(null)
  const [erreurAction, setErreurAction] = useState('')
  const [confirmationEnregistre, setConfirmationEnregistre] = useState(false)
  const [modaleOuverte, setModaleOuverte] = useState(false)
  const [lienLinkedin, setLienLinkedin] = useState(null)
  const [copieModaleReussie, setCopieModaleReussie] = useState(true)
  const boutonPublierRef = useRef(null)
  const boutonGenererRef = useRef(null)
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
        body: JSON.stringify({
          user_id: userId,
          info_id: sujetId,
          tonalite_id: tonaliteSelectionnee,
          voix_narrative: voixSelectionnee,
        }),
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
    setTonaliteSelectionnee(tonaliteId)
    setVoixSelectionnee(voixCode)
    setEtat('confirmation')
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

  if (etat === 'idle' || etat === 'confirmation') {
    return (
      <>
        <button
          type="button"
          ref={boutonGenererRef}
          className="bouton-primaire"
          onClick={gererClicGenerer}
          disabled={etat === 'confirmation'}
        >
          Générer un post
        </button>
        {etat === 'confirmation' && (
          <ModaleConfirmationGeneration
            sujetId={sujetId}
            tonalites={tonalites}
            tonaliteSelectionnee={tonaliteSelectionnee}
            onChangerTonalite={setTonaliteSelectionnee}
            voixSelectionnee={voixSelectionnee}
            onChangerVoix={setVoixSelectionnee}
            onModifierPreferences={onModifierPreferences}
            onConfirmer={genererPost}
            onAnnuler={() => setEtat('idle')}
            elementDeclencheur={boutonGenererRef}
          />
        )}
      </>
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
