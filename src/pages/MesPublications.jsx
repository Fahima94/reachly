import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import EnteteConnecte from '../components/EnteteConnecte.jsx'
import ModaleConfirmationPublication from '../components/ModaleConfirmationPublication.jsx'

const LIEN_VALIDE = /^https?:\/\//i

function formaterDate(date) {
  if (!date) return null
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function MesPublications({
  onNaviguer,
  onDeconnexionReussie,
  onRetour,
  onModifierPreferences,
}) {
  // chargement | erreur | pret
  const [etat, setEtat] = useState('chargement')
  const [publications, setPublications] = useState([])
  const [lienParInfoId, setLienParInfoId] = useState(new Map())
  const [lienLinkedinUtilisateur, setLienLinkedinUtilisateur] = useState(null)
  const [modificationEnCours, setModificationEnCours] = useState(null)
  const [erreurModification, setErreurModification] = useState(null) // { id, message } | null
  const [texteEnregistreId, setTexteEnregistreId] = useState(null)

  // Modale de confirmation après "Publier" — même composant que le tableau
  // de bord (src/components/ModaleConfirmationPublication.jsx).
  const [modaleOuverte, setModaleOuverte] = useState(false)
  const [copieModaleReussie, setCopieModaleReussie] = useState(true)
  const [lienModale, setLienModale] = useState({ composition: null, profil: null })
  const elementDeclencheurRef = useRef(null)

  // `estAnnule` protège contre le double montage de StrictMode en
  // développement — motif déjà utilisé sur les autres écrans de l'app.
  async function charger(estAnnule = () => false) {
    setEtat('chargement')
    try {
      const {
        data: { user },
        error: erreurUser,
      } = await supabase.auth.getUser()
      if (estAnnule()) return
      if (erreurUser || !user) {
        setEtat('erreur')
        return
      }

      const [{ data: pubs, error: erreurPubs }, { data: profil, error: erreurProfil }] =
        await Promise.all([
          supabase
            .from('Publications')
            .select('id, titre, contenu, statut, "date_création", date_publication, created_at, info_id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase.from('profiles').select('linkedin').eq('id', user.id).maybeSingle(),
        ])
      if (estAnnule()) return

      if (erreurPubs || erreurProfil) {
        setEtat('erreur')
        return
      }

      setLienLinkedinUtilisateur(profil?.linkedin || null)

      // Lien de l'article source, pour ouvrir directement la fenêtre de
      // composition LinkedIn dessus (comme sur le tableau de bord) — requête
      // séparée, pas d'embed, même motif que le reste de l'app.
      const idsInfos = [...new Set((pubs ?? []).map((p) => p.info_id).filter(Boolean))]
      if (idsInfos.length > 0) {
        const { data: infos, error: erreurInfos } = await supabase
          .from('Infos')
          .select('id, lien')
          .in('id', idsInfos)
        if (estAnnule()) return
        if (erreurInfos) {
          setEtat('erreur')
          return
        }
        setLienParInfoId(
          new Map(infos.map((i) => [i.id, LIEN_VALIDE.test(i.lien ?? '') ? i.lien : null])),
        )
      } else {
        setLienParInfoId(new Map())
      }

      setPublications(pubs ?? [])
      setEtat('pret')
    } catch {
      if (estAnnule()) return
      setEtat('erreur')
    }
  }

  useEffect(() => {
    let annule = false
    charger(() => annule)
    return () => {
      annule = true
    }
  }, [])

  // `.select()` indispensable : sans lui, un blocage RLS silencieux (0 ligne
  // concernée) ne remonte aucune erreur — motif déjà utilisé dans l'admin
  // (`Admin.jsx`) pour les mêmes raisons. Renvoie si la mise à jour a réussi,
  // pour que l'appelant puisse afficher une confirmation propre à son champ.
  async function appliquerMiseAJour(pub, correctifs) {
    setErreurModification(null)
    setModificationEnCours(pub.id)
    const { data, error } = await supabase
      .from('Publications')
      .update(correctifs)
      .eq('id', pub.id)
      .select()
    if (error || !data || data.length === 0) {
      setErreurModification({
        id: pub.id,
        message: 'La mise à jour a échoué. Vérifiez votre connexion et réessayez.',
      })
      setModificationEnCours(null)
      return false
    }
    setPublications((precedent) =>
      precedent.map((p) => (p.id === pub.id ? { ...p, ...correctifs } : p)),
    )
    setModificationEnCours(null)
    return true
  }

  // Le texte se modifie localement à chaque frappe (pas d'appel réseau tant
  // que "Enregistrer les modifications" n'est pas cliqué) — même principe
  // que le texte généré sur le tableau de bord (GenerationPost.jsx).
  function modifierTexteLocal(pubId, nouveauTexte) {
    setPublications((precedent) =>
      precedent.map((p) => (p.id === pubId ? { ...p, contenu: nouveauTexte } : p)),
    )
  }

  async function gererEnregistrerModifications(pub) {
    setTexteEnregistreId(null)
    const succes = await appliquerMiseAJour(pub, { contenu: pub.contenu })
    if (succes) {
      setTexteEnregistreId(pub.id)
      setTimeout(() => setTexteEnregistreId(null), 3000)
    }
  }

  // Seule façon de passer une publication à "Publié" depuis cet écran (plus
  // de sélecteur de statut libre) — même geste que "Publier" sur le tableau
  // de bord : statut + date du jour (si absente), copie dans le
  // presse-papiers, puis fenêtre de composition LinkedIn pré-attachée à
  // l'article source si on l'a, sinon le profil LinkedIn de la personne.
  // Enregistre aussi `contenu` : sans ça, un texte modifié juste avant de
  // publier (sans passer par "Enregistrer les modifications") serait copié
  // tel quel dans le presse-papiers/LinkedIn, mais la base garderait
  // l'ancien texte — désynchronisation entre ce qui est réellement publié
  // et ce que l'app enregistre.
  async function gererPublier(pub, evenement) {
    elementDeclencheurRef.current = evenement.currentTarget

    const correctifs = { statut: 'Publié', contenu: pub.contenu }
    if (!pub.date_publication) {
      correctifs.date_publication = new Date().toISOString().slice(0, 10)
    }
    const succes = await appliquerMiseAJour(pub, correctifs)
    if (!succes) return

    let copieReussie = true
    try {
      await navigator.clipboard.writeText(pub.contenu ?? '')
    } catch {
      copieReussie = false
    }
    setCopieModaleReussie(copieReussie)

    const lienSource = lienParInfoId.get(pub.info_id) ?? null
    setLienModale({
      composition: lienSource
        ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(lienSource)}`
        : null,
      profil: lienSource ? null : lienLinkedinUtilisateur,
    })
    setModaleOuverte(true)
  }

  return (
    <main>
      <EnteteConnecte onNaviguer={onNaviguer} onDeconnexionReussie={onDeconnexionReussie} />
      <header>
        <h1>Mes publications</h1>
        <button type="button" onClick={onRetour}>
          Retour au tableau de bord
        </button>
      </header>

      {etat === 'chargement' && <p role="status">Chargement de vos publications…</p>}

      {etat === 'erreur' && (
        <div>
          <p role="alert" className="erreur-globale">
            Impossible de récupérer vos publications. Vérifiez votre connexion et réessayez.
          </p>
          <button type="button" onClick={charger}>
            Réessayer
          </button>
        </div>
      )}

      {etat === 'pret' && publications.length === 0 && (
        <p role="status">
          Aucune publication pour l'instant — générez un post depuis le tableau de bord pour le
          voir apparaître ici.
        </p>
      )}

      {etat === 'pret' && publications.length > 0 && (
        <ol className="liste-publications">
          {publications.map((pub) => {
            const date = formaterDate(pub.date_publication ?? pub['date_création'] ?? pub.created_at)
            return (
              <li key={pub.id}>
                <details className="publication">
                  <summary>
                    <span>{pub.titre || '(Sans titre)'}</span>
                    <span className={`badge-statut-publication badge-statut-publication--${pub.statut}`}>
                      {pub.statut}
                    </span>
                    {date && <span className="meta-discrete">{date}</span>}
                  </summary>
                  {pub.statut === 'Publié' ? (
                    <>
                      <p className="texte-publication">{pub.contenu}</p>
                      <p className="meta-discrete">
                        Publié le {formaterDate(pub.date_publication)}.
                      </p>
                    </>
                  ) : (
                    <>
                      <label htmlFor={`texte-${pub.id}`} className="visually-hidden">
                        Texte de la publication « {pub.titre || 'sans titre'} »
                      </label>
                      <textarea
                        id={`texte-${pub.id}`}
                        value={pub.contenu ?? ''}
                        onChange={(e) => modifierTexteLocal(pub.id, e.target.value)}
                        rows={6}
                        className="texte-publication"
                      />
                      <p>
                        <button
                          type="button"
                          onClick={() => gererEnregistrerModifications(pub)}
                          disabled={modificationEnCours === pub.id}
                        >
                          {modificationEnCours === pub.id ? 'Enregistrement…' : 'Enregistrer les modifications'}
                        </button>
                        {texteEnregistreId === pub.id && <span role="status"> Enregistré !</span>}
                      </p>
                      <button
                        type="button"
                        className="bouton-primaire"
                        onClick={(e) => gererPublier(pub, e)}
                        disabled={modificationEnCours === pub.id}
                      >
                        {modificationEnCours === pub.id ? 'Publication…' : 'Publier'}
                      </button>
                    </>
                  )}
                  {erreurModification?.id === pub.id && (
                    <p role="alert">{erreurModification.message}</p>
                  )}
                </details>
              </li>
            )
          })}
        </ol>
      )}

      {modaleOuverte && (
        <ModaleConfirmationPublication
          lienComposition={lienModale.composition}
          lienLinkedin={lienModale.profil}
          copieReussie={copieModaleReussie}
          onFermer={() => setModaleOuverte(false)}
          onOuvrirPreferences={onModifierPreferences}
          elementDeclencheur={elementDeclencheurRef}
        />
      )}
    </main>
  )
}
