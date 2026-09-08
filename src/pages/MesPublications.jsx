import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import EnteteConnecte from '../components/EnteteConnecte.jsx'

function formaterDate(date) {
  if (!date) return null
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const STATUTS = ['Brouillon', 'Enregistré', 'Publié']

export default function MesPublications({ onNaviguer, onDeconnexionReussie, onRetour }) {
  // chargement | erreur | pret
  const [etat, setEtat] = useState('chargement')
  const [publications, setPublications] = useState([])
  const [modificationEnCours, setModificationEnCours] = useState(null)
  const [erreurModification, setErreurModification] = useState(null) // { id, message } | null
  const [texteEnregistreId, setTexteEnregistreId] = useState(null)

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

      const { data, error } = await supabase
        .from('Publications')
        .select('id, titre, contenu, statut, "date_création", date_publication, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (estAnnule()) return

      if (error) {
        setEtat('erreur')
        return
      }

      setPublications(data ?? [])
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

  function gererChangementStatut(pub, nouveauStatut) {
    // Passer à "Publié" sans date déjà enregistrée : celle du jour par
    // défaut, modifiable ensuite via le champ date qui apparaît.
    const correctifs = { statut: nouveauStatut }
    if (nouveauStatut === 'Publié' && !pub.date_publication) {
      correctifs.date_publication = new Date().toISOString().slice(0, 10)
    }
    appliquerMiseAJour(pub, correctifs)
  }

  function gererChangementDate(pub, nouvelleDate) {
    appliquerMiseAJour(pub, { date_publication: nouvelleDate || null })
  }

  // Le texte se modifie localement à chaque frappe (pas d'appel réseau tant
  // que "Enregistrer le texte" n'est pas cliqué) — même principe que le
  // texte généré sur le tableau de bord (GenerationPost.jsx).
  function modifierTexteLocal(pubId, nouveauTexte) {
    setPublications((precedent) =>
      precedent.map((p) => (p.id === pubId ? { ...p, contenu: nouveauTexte } : p)),
    )
  }

  async function gererEnregistrerTexte(pub) {
    setTexteEnregistreId(null)
    const succes = await appliquerMiseAJour(pub, { contenu: pub.contenu })
    if (succes) {
      setTexteEnregistreId(pub.id)
      setTimeout(() => setTexteEnregistreId(null), 3000)
    }
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
                      onClick={() => gererEnregistrerTexte(pub)}
                      disabled={modificationEnCours === pub.id}
                    >
                      {modificationEnCours === pub.id ? 'Enregistrement…' : 'Enregistrer le texte'}
                    </button>
                    {texteEnregistreId === pub.id && <span role="status"> Enregistré !</span>}
                  </p>

                  <div className="modifier-statut-publication">
                    <div>
                      <label htmlFor={`statut-${pub.id}`}>Statut</label>
                      <select
                        id={`statut-${pub.id}`}
                        value={pub.statut}
                        onChange={(e) => gererChangementStatut(pub, e.target.value)}
                        disabled={modificationEnCours === pub.id}
                      >
                        {STATUTS.map((statut) => (
                          <option key={statut} value={statut}>
                            {statut}
                          </option>
                        ))}
                      </select>
                    </div>
                    {pub.statut === 'Publié' && (
                      <div>
                        <label htmlFor={`date-${pub.id}`}>Date de publication</label>
                        <input
                          id={`date-${pub.id}`}
                          type="date"
                          value={pub.date_publication ?? ''}
                          onChange={(e) => gererChangementDate(pub, e.target.value)}
                          disabled={modificationEnCours === pub.id}
                        />
                      </div>
                    )}
                  </div>
                  {erreurModification?.id === pub.id && (
                    <p role="alert">{erreurModification.message}</p>
                  )}
                </details>
              </li>
            )
          })}
        </ol>
      )}
    </main>
  )
}
