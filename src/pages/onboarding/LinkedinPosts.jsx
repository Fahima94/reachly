import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import ProgressionOnboarding from '../../components/ProgressionOnboarding.jsx'
import { formaterProfilEditorial } from '../../lib/formaterProfilEditorial.jsx'
import { linkedinValide } from '../../lib/linkedin.js'
import EnteteConnecte from '../../components/EnteteConnecte.jsx'

async function analyserLeStyle(postsPourAnalyse) {
  const reponse = await fetch(import.meta.env.VITE_N8N_WEBHOOK_PROFIL_EDITORIAL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ posts: postsPourAnalyse }),
  })

  if (!reponse.ok) {
    throw new Error('echec-analyse')
  }

  const donnees = await reponse.json()
  if (!donnees?.success || typeof donnees.profil_editorial !== 'string') {
    throw new Error('echec-analyse')
  }

  return donnees.profil_editorial
}

export default function LinkedinPosts({ onNaviguer, onDeconnexionReussie, onEtapeSuivante }) {
  const [linkedin, setLinkedin] = useState('')
  const [posts, setPosts] = useState([''])
  const [profilEditorial, setProfilEditorial] = useState('')
  const [chargementInitial, setChargementInitial] = useState(true)
  const [erreurChargement, setErreurChargement] = useState('')
  const [statut, setStatut] = useState('idle') // idle | chargement
  const [erreurGlobale, setErreurGlobale] = useState('')
  const [analyseEnCours, setAnalyseEnCours] = useState(false)
  const [erreurAnalyse, setErreurAnalyse] = useState('')
  const [sauvegardePostsEnCours, setSauvegardePostsEnCours] = useState(false)
  const [erreurSauvegardePosts, setErreurSauvegardePosts] = useState('')
  const [confirmationSauvegardePosts, setConfirmationSauvegardePosts] = useState(false)

  const enCours = statut === 'chargement'

  // `estAnnule` protège contre le double montage de StrictMode en
  // développement : si ce chargement a été annulé (montage suivant déjà en
  // cours), on n'écrase pas un état plus frais avec une réponse en retard.
  async function chargerProfil(estAnnule = () => false) {
    setErreurChargement('')
    setChargementInitial(true)
    try {
      const {
        data: { user },
        error: erreurUtilisateur,
      } = await supabase.auth.getUser()
      if (estAnnule()) return

      if (erreurUtilisateur || !user) {
        setErreurChargement('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
        setChargementInitial(false)
        return
      }

      // Pré-remplissage : lit le profil LinkedIn, les exemples de posts et le
      // profil éditorial déjà enregistrés (relance de l'onboarding). Premier
      // onboarding → data null.
      const { data, error } = await supabase
        .from('profiles')
        .select('linkedin, posts_exemples, profil_editorial')
        .eq('id', user.id)
        .maybeSingle()
      if (estAnnule()) return

      if (error) {
        setErreurChargement('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
        setChargementInitial(false)
        return
      }

      if (data) {
        setLinkedin(data.linkedin ?? '')
        const exemples = Array.isArray(data.posts_exemples) ? data.posts_exemples : []
        // Garde toujours au moins une zone de texte visible.
        setPosts(exemples.length > 0 ? exemples : [''])
        setProfilEditorial(data.profil_editorial ?? '')
      }
      setChargementInitial(false)
    } catch {
      if (estAnnule()) return
      setErreurChargement('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
      setChargementInitial(false)
    }
  }

  useEffect(() => {
    let annule = false
    chargerProfil(() => annule)
    return () => {
      annule = true
    }
  }, [])

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

  const postsNonVidesActuels = posts.map((p) => p.trim()).filter(Boolean)
  const profilGenere = profilEditorial.trim() !== ''

  // Enregistre uniquement LinkedIn + les posts, sans toucher au reste du
  // profil ni déclencher l'analyse du profil éditorial. Renvoie un booléen
  // (plutôt que rien) pour que `sauvegarderEtAnalyser` sache si elle peut
  // enchaîner sur l'analyse.
  async function sauvegarderPosts() {
    setErreurSauvegardePosts('')
    setSauvegardePostsEnCours(true)
    try {
      const {
        data: { user },
        error: erreurUtilisateur,
      } = await supabase.auth.getUser()

      if (erreurUtilisateur || !user) {
        setErreurSauvegardePosts("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
        setSauvegardePostsEnCours(false)
        return false
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        linkedin: linkedinValide(linkedin),
        posts_exemples: postsNonVidesActuels,
      })

      if (error) {
        setErreurSauvegardePosts("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
        setSauvegardePostsEnCours(false)
        return false
      }

      setConfirmationSauvegardePosts(true)
      setTimeout(() => setConfirmationSauvegardePosts(false), 3000)
      setSauvegardePostsEnCours(false)
      return true
    } catch {
      setErreurSauvegardePosts("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.")
      setSauvegardePostsEnCours(false)
      return false
    }
  }

  // Un seul geste pour l'utilisateur : enregistrer ses posts puis, s'il y en
  // a, enchaîner tout de suite sur l'analyse de style — plutôt que deux
  // boutons dans deux fieldsets séparés qu'il fallait deviner d'enchaîner
  // (retour utilisateur : la fonctionnalité passait inaperçue).
  async function sauvegarderEtAnalyser() {
    const succes = await sauvegarderPosts()
    if (!succes || postsNonVidesActuels.length === 0) return
    await gererRegenerer()
  }

  async function gererRegenerer() {
    if (postsNonVidesActuels.length === 0) return
    setErreurAnalyse('')
    setAnalyseEnCours(true)
    try {
      const profil = await analyserLeStyle(postsNonVidesActuels)
      setProfilEditorial(profil)
    } catch {
      setErreurAnalyse('La régénération a échoué. Vérifiez votre connexion et réessayez.')
    } finally {
      setAnalyseEnCours(false)
    }
  }

  async function gererValidation(evenement) {
    evenement.preventDefault()
    setErreurGlobale('')

    const linkedinTrim = linkedinValide(linkedin)
    const postsNonVides = posts.map((p) => p.trim()).filter(Boolean)
    const profilTrim = profilEditorial.trim()

    // Rien à enregistrer : on termine directement, sans appel.
    if (!linkedinTrim && postsNonVides.length === 0 && !profilTrim) {
      onEtapeSuivante()
      return
    }

    setStatut('chargement')
    try {
      // Le profil éditorial n'est plus jamais généré automatiquement à la
      // validation — uniquement via le bouton "Générer à partir de mes
      // posts" / "Régénérer", qui met déjà `profilEditorial` à jour avant
      // qu'on arrive ici. On enregistre donc simplement sa valeur actuelle.
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
        profil_editorial: profilTrim || null,
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
      <EnteteConnecte onNaviguer={onNaviguer} onDeconnexionReussie={onDeconnexionReussie} />
      <ProgressionOnboarding etape={5} total={5} />
      <p>Ces informations nous aident à mieux orienter votre veille et vos posts.</p>
      <h1>LinkedIn et posts existants</h1>

      {chargementInitial && <p role="status">Chargement de vos réponses…</p>}

      {!chargementInitial && erreurChargement && (
        <div>
          <p role="alert" className="erreur-globale">
            {erreurChargement}
          </p>
          <button type="button" onClick={() => chargerProfil()}>
            Réessayer
          </button>
        </div>
      )}

      {!chargementInitial && !erreurChargement && (
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

          <fieldset aria-describedby="posts-inspirants-description">
            <legend>Posts inspirants</legend>
            <p id="posts-inspirants-description" className="description-choix">
              Colle 1 à 3 posts que tu apprécies — les tiens ou ceux d'autres personnes —
              pour que Reachly écrive dans ton style, pas un style générique.
            </p>
            {!profilGenere && postsNonVidesActuels.length === 0 && (
              <p className="exemple-profil-editorial">
                Exemple de résultat une fois analysé : « Style détecté : direct, orienté
                résultats, peu d'emojis. »
              </p>
            )}
            {posts.map((post, index) => (
              <div key={index}>
                <label htmlFor={`post-${index}`}>Post {index + 1}</label>
                <textarea
                  id={`post-${index}`}
                  value={post}
                  onChange={(e) => modifierPost(index, e.target.value)}
                  placeholder="Colle ici le texte complet d'un post LinkedIn que tu apprécies…"
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

          <p>
            {erreurSauvegardePosts && <span role="alert">{erreurSauvegardePosts} </span>}
            {erreurAnalyse && <span role="alert">{erreurAnalyse} </span>}
            <button
              type="button"
              onClick={sauvegarderEtAnalyser}
              disabled={sauvegardePostsEnCours || analyseEnCours || enCours}
            >
              {sauvegardePostsEnCours || analyseEnCours
                ? 'Enregistrement…'
                : postsNonVidesActuels.length === 0
                  ? 'Enregistrer mes posts'
                  : profilGenere
                    ? 'Enregistrer et régénérer mon profil'
                    : 'Enregistrer et analyser mon style'}
            </button>
            {confirmationSauvegardePosts && <span role="status"> Enregistré !</span>}
          </p>

          {profilGenere && (
            <fieldset>
              <legend>Profil éditorial</legend>
              <div className="profil-editorial-formate">
                {formaterProfilEditorial(profilEditorial)}
              </div>
            </fieldset>
          )}

          <button type="submit" disabled={enCours} aria-busy={enCours}>
            {enCours ? 'Enregistrement en cours…' : 'Terminer'}
          </button>

          <p>
            <button type="button" onClick={gererIgnorer} disabled={enCours}>
              Ignorer cette étape
            </button>
          </p>
        </form>
      )}
    </main>
  )
}
