import { useState } from 'react'

export default function GenerationPost({ sujetId, userId, tonaliteDefinie, onModifierPreferences }) {
  // idle | manque-tonalite | chargement | pret | erreur
  const [etat, setEtat] = useState('idle')
  const [texte, setTexte] = useState('')
  const [copieConfirmee, setCopieConfirmee] = useState(false)
  const [erreurCopie, setErreurCopie] = useState(false)

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

  return (
    <div>
      <label htmlFor={idTexte}>Texte du post généré, modifiable</label>
      <textarea id={idTexte} value={texte} onChange={(e) => setTexte(e.target.value)} rows={6} />
      <p>
        <button type="button" onClick={gererCopie}>
          Copier
        </button>
        {copieConfirmee && <span role="status"> Copié !</span>}
        {erreurCopie && (
          <span role="alert"> La copie a échoué — sélectionnez et copiez le texte manuellement.</span>
        )}
      </p>
    </div>
  )
}
