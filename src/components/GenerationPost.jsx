import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import ModaleConfirmationPublication from './ModaleConfirmationPublication.jsx'

const VOIX_NARRATIVES = [
  { valeur: 'je_masculin', libelle: 'Je (masculin)' },
  { valeur: 'je_feminin', libelle: 'Je (féminin)' },
  { valeur: 'nous_masculin', libelle: 'Nous (masculin pluriel)' },
  { valeur: 'nous_feminin', libelle: 'Nous (féminin pluriel)' },
  { valeur: 'nous_inclusif', libelle: 'Nous (pluriel inclusif)' },
]

function IconeGeneration() {
  return (
    <span className="points-generation" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
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
  const selectTonaliteRef = useRef(null)

  useEffect(() => {
    // Le bouton principal est désactivé tant qu'aucune tonalité n'est
    // choisie (il ne peut alors pas recevoir le focus) — on envoie le focus
    // initial sur le select dans ce cas, sinon sur le bouton comme avant.
    if (tonaliteSelectionnee) {
      boutonPrincipalRef.current?.focus()
    } else {
      selectTonaliteRef.current?.focus()
    }

    function gererClavier(evenement) {
      if (evenement.key === 'Escape') {
        onAnnuler()
        return
      }
      if (evenement.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll('button, a[href], select')
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
            ref={selectTonaliteRef}
            value={tonaliteSelectionnee ?? ''}
            onChange={(e) => onChangerTonalite(e.target.value)}
            required
            aria-describedby={!tonaliteSelectionnee ? `tonalite-requise-${sujetId}` : undefined}
          >
            <option value="" disabled>
              Choisissez une tonalité…
            </option>
            {tonalites.map((t) => (
              <option key={t.id} value={t.id}>
                {t['Visée de la publication']}
              </option>
            ))}
          </select>
          {!tonaliteSelectionnee && (
            <p id={`tonalite-requise-${sujetId}`} className="description-choix">
              Une tonalité est nécessaire pour générer ce post.
            </p>
          )}
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
          <button
            type="button"
            ref={boutonPrincipalRef}
            className="bouton-primaire"
            onClick={onConfirmer}
            disabled={!tonaliteSelectionnee}
          >
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
  sujetLien,
  userId,
  tonalites,
  tonaliteId,
  voixCode,
  onModifierPreferences,
}) {
  // idle | confirmation | chargement | pret | erreur
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

  // Ouvre la fenêtre de publication LinkedIn elle-même (pas juste le profil),
  // pré-attachée à l'article source — LinkedIn n'expose aucun moyen officiel
  // de pré-remplir le texte du post (vérifié : `shareArticle` est déprécié,
  // seul `share-offsite` reste supporté et ne prend qu'une URL). La personne
  // colle le texte déjà copié comme commentaire et publie elle-même — jamais
  // d'appel à l'API LinkedIn, jamais de publication automatique.
  // Remis en test le 2026-09-10 (retiré une première fois car la carte de
  // lien attachée déroge à la règle "pas de lien dans le texte" — à évaluer
  // en conditions réelles sur LinkedIn avant de trancher définitivement).
  const lienComposition = sujetLien
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sujetLien)}`
    : null

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

  // La tonalité par défaut du profil (si elle existe) ne fait plus que
  // pré-remplir ce choix — elle ne dispense jamais de le confirmer : la
  // personne doit explicitement avoir une tonalité sélectionnée dans la
  // modale avant de pouvoir générer (bouton désactivé sinon).
  function gererClicGenerer() {
    setTonaliteSelectionnee(tonaliteId ?? '')
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

    // La copie presse-papiers doit rester le tout premier `await` de la
    // fonction, avant n'importe quel appel réseau — certains navigateurs
    // (Safari/WebKit notamment) exigent que `navigator.clipboard.writeText`
    // reste dans le prolongement direct du geste de clic ; un `await` réseau
    // avant elle peut lui faire perdre cette autorisation et la faire
    // échouer silencieusement (retour utilisateur : l'URL arrive bien dans
    // la fenêtre LinkedIn, mais pas le texte à coller).
    let copieReussie = true
    if (nouveauStatut === 'Publié') {
      try {
        await navigator.clipboard.writeText(texte)
      } catch {
        copieReussie = false
      }
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

      // Publié : la copie presse-papiers a déjà eu lieu plus haut.
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
          lienComposition={lienComposition}
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
