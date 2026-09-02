import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'

export default function LinkedinPosts({ onEtapeSuivante }) {
  const [linkedin, setLinkedin] = useState('')
  const [posts, setPosts] = useState([''])
  const [statut, setStatut] = useState('idle') // idle | chargement
  const [erreurGlobale, setErreurGlobale] = useState('')

  const enCours = statut === 'chargement'

  function modifierPost(index, valeur) {
    setPosts((precedent) => precedent.map((p, i) => (i === index ? valeur : p)))
  }

  function ajouterPost() {
    setPosts((precedent) => [...precedent, ''])
  }

  function retirerPost(index) {
    setPosts((precedent) => {
      // Garde toujours au moins une zone de texte visible : si c'est la
      // seule, on la vide plutôt que de la retirer.
      if (precedent.length === 1) {
        return ['']
      }
      return precedent.filter((_, i) => i !== index)
    })
  }

  async function gererValidation(evenement) {
    evenement.preventDefault()
    setErreurGlobale('')

    const linkedinTrim = linkedin.trim()
    const postsNonVides = posts.map((p) => p.trim()).filter(Boolean)

    // Rien à enregistrer : on termine directement, sans appel.
    if (!linkedinTrim && postsNonVides.length === 0) {
      onEtapeSuivante()
      return
    }

    setStatut('chargement')
    try {
      const {
        data: { user },
        error: erreurUtilisateur,
      } = await supabase.auth.getUser()

      if (erreurUtilisateur || !user) {
        setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
        setStatut('idle')
        return
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        linkedin: linkedinTrim || null,
        posts_exemples: postsNonVides,
      })

      if (error) {
        setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
        setStatut('idle')
        return
      }

      onEtapeSuivante()
    } catch {
      setErreurGlobale("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
      setStatut('idle')
    }
  }

  function gererIgnorer() {
    onEtapeSuivante()
  }

  return (
    <main>
      <p>Étape 5 sur 5</p>
      <p>Ces informations nous aident à mieux orienter votre veille et vos posts.</p>
      <h1>LinkedIn et posts existants</h1>
      <form onSubmit={gererValidation} noValidate>
        {erreurGlobale && (
          <p role="alert" className="erreur-globale">
            {erreurGlobale}
          </p>
        )}

        <div>
          <label htmlFor="linkedin">Profil LinkedIn</label>
          <input
            id="linkedin"
            name="linkedin"
            type="text"
            autoComplete="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
          />
        </div>

        <fieldset>
          <legend>Posts ou documents existants</legend>
          {posts.map((post, index) => (
            <div key={index}>
              <label htmlFor={`post-${index}`}>Post {index + 1}</label>
              <textarea
                id={`post-${index}`}
                value={post}
                onChange={(e) => modifierPost(index, e.target.value)}
              />
              <button type="button" onClick={() => retirerPost(index)}>
                Retirer ce post
              </button>
            </div>
          ))}
          <button type="button" onClick={ajouterPost}>
            Ajouter un autre post
          </button>
        </fieldset>

        <button type="submit" disabled={enCours} aria-busy={enCours}>
          {enCours ? 'Enregistrement en cours…' : 'Terminer'}
        </button>

        <p>
          <button type="button" onClick={gererIgnorer} disabled={enCours}>
            Ignorer cette étape
          </button>
        </p>
      </form>
    </main>
  )
}
