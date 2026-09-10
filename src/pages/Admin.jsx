import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { estAdmin } from '../lib/admin.js'
import LogoReachly from '../components/LogoReachly.jsx'

const MSG_ECHEC = 'Une erreur est survenue. Vérifiez votre connexion et réessayez.'

function SectionCategories() {
  const [categories, setCategories] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [nom, setNom] = useState('')
  const [type, setType] = useState('thème')
  const [ajoutEnCours, setAjoutEnCours] = useState(false)
  const [erreurAjout, setErreurAjout] = useState('')

  // Édition sur place (une seule ligne à la fois) — mêmes noms de variables
  // et même geste "Modifier" → champs éditables → "Enregistrer"/"Annuler"
  // que pour Tonalités et Sources plus bas.
  const [ligneEnEdition, setLigneEnEdition] = useState(null)
  const [nomEdition, setNomEdition] = useState('')
  const [typeEdition, setTypeEdition] = useState('thème')
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false)
  const [erreurEdition, setErreurEdition] = useState('')

  async function charger() {
    setErreur('')
    setChargement(true)
    const { data, error } = await supabase
      .from('Catégories')
      .select('id, nom, type')
      .order('type')
      .order('nom')
    if (error) {
      setErreur(MSG_ECHEC)
      setChargement(false)
      return
    }
    setCategories(data)
    setChargement(false)
  }

  useEffect(() => {
    charger()
  }, [])

  async function gererAjout(evenement) {
    evenement.preventDefault()
    setErreurAjout('')
    if (!nom.trim()) {
      setErreurAjout('Renseignez un nom.')
      return
    }
    setAjoutEnCours(true)
    const { error } = await supabase.from('Catégories').insert({ nom: nom.trim(), type })
    if (error) {
      setErreurAjout(MSG_ECHEC)
      setAjoutEnCours(false)
      return
    }
    setNom('')
    setAjoutEnCours(false)
    charger()
  }

  function gererDebutEdition(categorie) {
    setErreurEdition('')
    setLigneEnEdition(categorie.id)
    setNomEdition(categorie.nom)
    setTypeEdition(categorie.type)
  }

  function gererAnnulerEdition() {
    setLigneEnEdition(null)
    setErreurEdition('')
  }

  async function gererEnregistrerEdition(categorie) {
    setErreurEdition('')
    if (!nomEdition.trim()) {
      setErreurEdition('Renseignez un nom.')
      return
    }
    setEnregistrementEnCours(true)
    // `.select()` indispensable : sans lui, un blocage RLS silencieux (0
    // ligne concernée) ne remonte aucune erreur.
    const { data, error } = await supabase
      .from('Catégories')
      .update({ nom: nomEdition.trim(), type: typeEdition })
      .eq('id', categorie.id)
      .select()
    if (error || !data || data.length === 0) {
      setErreurEdition(MSG_ECHEC)
      setEnregistrementEnCours(false)
      return
    }
    setCategories((precedent) =>
      precedent.map((c) =>
        c.id === categorie.id ? { ...c, nom: nomEdition.trim(), type: typeEdition } : c,
      ),
    )
    setEnregistrementEnCours(false)
    setLigneEnEdition(null)
  }

  return (
    <section>
      <h3>Catégories</h3>
      {chargement && <p role="status">Chargement…</p>}
      {!chargement && erreur && (
        <div>
          <p role="alert">{erreur}</p>
          <button type="button" onClick={charger} aria-label="Réessayer de charger les catégories">
            Réessayer
          </button>
        </div>
      )}
      {!chargement && !erreur && (
        <>
          {erreurEdition && <p role="alert">{erreurEdition}</p>}
          {categories.length === 0 ? (
            <p>Aucune catégorie enregistrée.</p>
          ) : (
            <div className="tableau-admin-conteneur">
              <table>
                <caption className="visually-hidden">Liste des catégories</caption>
                <thead>
                  <tr>
                    <th scope="col">Nom</th>
                    <th scope="col">Type</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) =>
                    ligneEnEdition === c.id ? (
                      <tr key={c.id}>
                        <td>
                          <label className="visually-hidden" htmlFor={`categorie-nom-edition-${c.id}`}>
                            Nom de la catégorie
                          </label>
                          <input
                            id={`categorie-nom-edition-${c.id}`}
                            value={nomEdition}
                            onChange={(e) => setNomEdition(e.target.value)}
                          />
                        </td>
                        <td>
                          <label className="visually-hidden" htmlFor={`categorie-type-edition-${c.id}`}>
                            Type de la catégorie
                          </label>
                          <select
                            id={`categorie-type-edition-${c.id}`}
                            value={typeEdition}
                            onChange={(e) => setTypeEdition(e.target.value)}
                          >
                            <option value="thème">thème</option>
                            <option value="métier">métier</option>
                            <option value="secteur">secteur</option>
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="bouton-primaire"
                            onClick={() => gererEnregistrerEdition(c)}
                            disabled={enregistrementEnCours}
                            aria-busy={enregistrementEnCours}
                          >
                            {enregistrementEnCours ? 'Enregistrement…' : 'Enregistrer'}
                          </button>
                          <button type="button" onClick={gererAnnulerEdition} disabled={enregistrementEnCours}>
                            Annuler
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={c.id}>
                        <td>{c.nom}</td>
                        <td>{c.type}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => gererDebutEdition(c)}
                            aria-label={`Modifier la catégorie ${c.nom}`}
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
          <form onSubmit={gererAjout} noValidate>
            {erreurAjout && <p role="alert">{erreurAjout}</p>}
            <div>
              <label htmlFor="categorie-nom">Nom</label>
              <input id="categorie-nom" value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
            <div>
              <label htmlFor="categorie-type">Type</label>
              <select id="categorie-type" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="thème">thème</option>
                <option value="métier">métier</option>
                <option value="secteur">secteur</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={ajoutEnCours}
              aria-busy={ajoutEnCours}
              aria-label={ajoutEnCours ? undefined : 'Ajouter une catégorie'}
            >
              {ajoutEnCours ? 'Ajout…' : 'Ajouter'}
            </button>
          </form>
        </>
      )}
    </section>
  )
}

function SectionTonalites() {
  const [tonalites, setTonalites] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [nom, setNom] = useState('')
  const [descriptif, setDescriptif] = useState('')
  const [ajoutEnCours, setAjoutEnCours] = useState(false)
  const [erreurAjout, setErreurAjout] = useState('')

  const [ligneEnEdition, setLigneEnEdition] = useState(null)
  const [nomEdition, setNomEdition] = useState('')
  const [descriptifEdition, setDescriptifEdition] = useState('')
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false)
  const [erreurEdition, setErreurEdition] = useState('')

  async function charger() {
    setErreur('')
    setChargement(true)
    const { data, error } = await supabase
      .from('Tonalités')
      .select('id, "Visée de la publication", descriptif')
      .order('Visée de la publication')
    if (error) {
      setErreur(MSG_ECHEC)
      setChargement(false)
      return
    }
    setTonalites(data)
    setChargement(false)
  }

  useEffect(() => {
    charger()
  }, [])

  async function gererAjout(evenement) {
    evenement.preventDefault()
    setErreurAjout('')
    if (!nom.trim()) {
      setErreurAjout('Renseignez un nom.')
      return
    }
    setAjoutEnCours(true)
    const { error } = await supabase
      .from('Tonalités')
      .insert({ 'Visée de la publication': nom.trim(), descriptif: descriptif.trim() || null })
    if (error) {
      setErreurAjout(MSG_ECHEC)
      setAjoutEnCours(false)
      return
    }
    setNom('')
    setDescriptif('')
    setAjoutEnCours(false)
    charger()
  }

  function gererDebutEdition(tonalite) {
    setErreurEdition('')
    setLigneEnEdition(tonalite.id)
    setNomEdition(tonalite['Visée de la publication'])
    setDescriptifEdition(tonalite.descriptif ?? '')
  }

  function gererAnnulerEdition() {
    setLigneEnEdition(null)
    setErreurEdition('')
  }

  async function gererEnregistrerEdition(tonalite) {
    setErreurEdition('')
    if (!nomEdition.trim()) {
      setErreurEdition('Renseignez un nom.')
      return
    }
    setEnregistrementEnCours(true)
    const { data, error } = await supabase
      .from('Tonalités')
      .update({
        'Visée de la publication': nomEdition.trim(),
        descriptif: descriptifEdition.trim() || null,
      })
      .eq('id', tonalite.id)
      .select()
    if (error || !data || data.length === 0) {
      setErreurEdition(MSG_ECHEC)
      setEnregistrementEnCours(false)
      return
    }
    setTonalites((precedent) =>
      precedent.map((t) =>
        t.id === tonalite.id
          ? { ...t, 'Visée de la publication': nomEdition.trim(), descriptif: descriptifEdition.trim() || null }
          : t,
      ),
    )
    setEnregistrementEnCours(false)
    setLigneEnEdition(null)
  }

  return (
    <section>
      <h3>Tonalités</h3>
      {chargement && <p role="status">Chargement…</p>}
      {!chargement && erreur && (
        <div>
          <p role="alert">{erreur}</p>
          <button type="button" onClick={charger} aria-label="Réessayer de charger les tonalités">
            Réessayer
          </button>
        </div>
      )}
      {!chargement && !erreur && (
        <>
          {erreurEdition && <p role="alert">{erreurEdition}</p>}
          {tonalites.length === 0 ? (
            <p>Aucune tonalité enregistrée.</p>
          ) : (
            <div className="tableau-admin-conteneur">
              <table>
                <caption className="visually-hidden">Liste des tonalités</caption>
                <thead>
                  <tr>
                    <th scope="col">Nom</th>
                    <th scope="col">Descriptif</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tonalites.map((t) =>
                    ligneEnEdition === t.id ? (
                      <tr key={t.id}>
                        <td>
                          <label className="visually-hidden" htmlFor={`tonalite-nom-edition-${t.id}`}>
                            Nom de la tonalité
                          </label>
                          <input
                            id={`tonalite-nom-edition-${t.id}`}
                            value={nomEdition}
                            onChange={(e) => setNomEdition(e.target.value)}
                          />
                        </td>
                        <td>
                          <label className="visually-hidden" htmlFor={`tonalite-descriptif-edition-${t.id}`}>
                            Descriptif de la tonalité
                          </label>
                          <input
                            id={`tonalite-descriptif-edition-${t.id}`}
                            value={descriptifEdition}
                            onChange={(e) => setDescriptifEdition(e.target.value)}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="bouton-primaire"
                            onClick={() => gererEnregistrerEdition(t)}
                            disabled={enregistrementEnCours}
                            aria-busy={enregistrementEnCours}
                          >
                            {enregistrementEnCours ? 'Enregistrement…' : 'Enregistrer'}
                          </button>
                          <button type="button" onClick={gererAnnulerEdition} disabled={enregistrementEnCours}>
                            Annuler
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={t.id}>
                        <td>{t['Visée de la publication']}</td>
                        <td>{t.descriptif || '—'}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => gererDebutEdition(t)}
                            aria-label={`Modifier la tonalité ${t['Visée de la publication']}`}
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
          <form onSubmit={gererAjout} noValidate>
            {erreurAjout && <p role="alert">{erreurAjout}</p>}
            <div>
              <label htmlFor="tonalite-nom">Nom</label>
              <input id="tonalite-nom" value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
            <div>
              <label htmlFor="tonalite-descriptif">Descriptif (facultatif)</label>
              <input
                id="tonalite-descriptif"
                value={descriptif}
                onChange={(e) => setDescriptif(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={ajoutEnCours}
              aria-busy={ajoutEnCours}
              aria-label={ajoutEnCours ? undefined : 'Ajouter une tonalité'}
            >
              {ajoutEnCours ? 'Ajout…' : 'Ajouter'}
            </button>
          </form>
        </>
      )}
    </section>
  )
}

function SectionSources() {
  const [sources, setSources] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [nom, setNom] = useState('')
  const [ajoutEnCours, setAjoutEnCours] = useState(false)
  const [erreurAjout, setErreurAjout] = useState('')
  const [basculeEnCours, setBasculeEnCours] = useState(null)
  const [erreurBascule, setErreurBascule] = useState('')

  const [ligneEnEdition, setLigneEnEdition] = useState(null)
  const [nomEdition, setNomEdition] = useState('')
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false)
  const [erreurEdition, setErreurEdition] = useState('')

  async function charger() {
    setErreur('')
    setChargement(true)
    const { data, error } = await supabase
      .from('Sources')
      .select('id, nom, actif')
      .order('nom')
    if (error) {
      setErreur(MSG_ECHEC)
      setChargement(false)
      return
    }
    setSources(data)
    setChargement(false)
  }

  useEffect(() => {
    charger()
  }, [])

  async function gererAjout(evenement) {
    evenement.preventDefault()
    setErreurAjout('')
    if (!nom.trim()) {
      setErreurAjout('Renseignez un nom.')
      return
    }
    setAjoutEnCours(true)
    const { error } = await supabase.from('Sources').insert({ nom: nom.trim(), actif: true })
    if (error) {
      setErreurAjout(MSG_ECHEC)
      setAjoutEnCours(false)
      return
    }
    setNom('')
    setAjoutEnCours(false)
    charger()
  }

  async function gererBascule(source) {
    setErreurBascule('')
    setBasculeEnCours(source.id)
    // `.select()` est indispensable ici : sans lui, une mise à jour bloquée
    // par une policy RLS (0 ligne concernée) ne renvoie aucune erreur — on
    // ne peut détecter l'échec silencieux qu'en vérifiant qu'une ligne est
    // effectivement revenue.
    const { data, error } = await supabase
      .from('Sources')
      .update({ actif: !source.actif })
      .eq('id', source.id)
      .select()
    if (error || !data || data.length === 0) {
      setErreurBascule(MSG_ECHEC)
      setBasculeEnCours(null)
      return
    }
    setSources((precedent) =>
      precedent.map((s) => (s.id === source.id ? { ...s, actif: !s.actif } : s)),
    )
    setBasculeEnCours(null)
  }

  function gererDebutEdition(source) {
    setErreurEdition('')
    setLigneEnEdition(source.id)
    setNomEdition(source.nom)
  }

  function gererAnnulerEdition() {
    setLigneEnEdition(null)
    setErreurEdition('')
  }

  async function gererEnregistrerEdition(source) {
    setErreurEdition('')
    if (!nomEdition.trim()) {
      setErreurEdition('Renseignez un nom.')
      return
    }
    setEnregistrementEnCours(true)
    const { data, error } = await supabase
      .from('Sources')
      .update({ nom: nomEdition.trim() })
      .eq('id', source.id)
      .select()
    if (error || !data || data.length === 0) {
      setErreurEdition(MSG_ECHEC)
      setEnregistrementEnCours(false)
      return
    }
    setSources((precedent) =>
      precedent.map((s) => (s.id === source.id ? { ...s, nom: nomEdition.trim() } : s)),
    )
    setEnregistrementEnCours(false)
    setLigneEnEdition(null)
  }

  return (
    <section>
      <h3>Sources</h3>
      {chargement && <p role="status">Chargement…</p>}
      {!chargement && erreur && (
        <div>
          <p role="alert">{erreur}</p>
          <button type="button" onClick={charger} aria-label="Réessayer de charger les sources">
            Réessayer
          </button>
        </div>
      )}
      {!chargement && !erreur && (
        <>
          {erreurBascule && <p role="alert">{erreurBascule}</p>}
          {erreurEdition && <p role="alert">{erreurEdition}</p>}
          {sources.length === 0 ? (
            <p>Aucune source enregistrée.</p>
          ) : (
            <div className="tableau-admin-conteneur">
              <table>
                <caption className="visually-hidden">Liste des sources</caption>
                <thead>
                  <tr>
                    <th scope="col">Nom</th>
                    <th scope="col">Statut</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s) =>
                    ligneEnEdition === s.id ? (
                      <tr key={s.id}>
                        <td>
                          <label className="visually-hidden" htmlFor={`source-nom-edition-${s.id}`}>
                            Nom de la source
                          </label>
                          <input
                            id={`source-nom-edition-${s.id}`}
                            value={nomEdition}
                            onChange={(e) => setNomEdition(e.target.value)}
                          />
                        </td>
                        <td>
                          <span className={`badge-statut-actif badge-statut-actif--${s.actif ? 'actif' : 'inactif'}`}>
                            {s.actif ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="bouton-primaire"
                            onClick={() => gererEnregistrerEdition(s)}
                            disabled={enregistrementEnCours}
                            aria-busy={enregistrementEnCours}
                          >
                            {enregistrementEnCours ? 'Enregistrement…' : 'Enregistrer'}
                          </button>
                          <button type="button" onClick={gererAnnulerEdition} disabled={enregistrementEnCours}>
                            Annuler
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={s.id}>
                        <td>{s.nom}</td>
                        <td>
                          <span className={`badge-statut-actif badge-statut-actif--${s.actif ? 'actif' : 'inactif'}`}>
                            {s.actif ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => gererDebutEdition(s)}
                            aria-label={`Modifier la source ${s.nom}`}
                          >
                            Modifier
                          </button>{' '}
                          <button
                            type="button"
                            onClick={() => gererBascule(s)}
                            disabled={basculeEnCours === s.id}
                            aria-label={`${s.actif ? 'Désactiver' : 'Activer'} la source ${s.nom}`}
                          >
                            {s.actif ? 'Désactiver' : 'Activer'}
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
          <form onSubmit={gererAjout} noValidate>
            {erreurAjout && <p role="alert">{erreurAjout}</p>}
            <div>
              <label htmlFor="source-nom">Nom</label>
              <input id="source-nom" value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
            <button
              type="submit"
              disabled={ajoutEnCours}
              aria-busy={ajoutEnCours}
              aria-label={ajoutEnCours ? undefined : 'Ajouter une source'}
            >
              {ajoutEnCours ? 'Ajout…' : 'Ajouter'}
            </button>
          </form>
        </>
      )}
    </section>
  )
}

function SectionVeille() {
  const [sujets, setSujets] = useState([])
  const [echecs, setEchecs] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [masquageEnCours, setMasquageEnCours] = useState(null)
  const [erreurMasquage, setErreurMasquage] = useState('')

  async function charger() {
    setErreur('')
    setChargement(true)
    const seuil = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    const [infosReponse, echecsReponse] = await Promise.all([
      supabase
        .from('Infos')
        .select('id, titre_recomposé, score, masque, created_at')
        .gte('created_at', seuil)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('Sujets_veille')
        .select('id, titre, tentatives_scraping')
        .gt('tentatives_scraping', 0)
        .order('tentatives_scraping', { ascending: false })
        .limit(50),
    ])
    if (infosReponse.error || echecsReponse.error) {
      setErreur(MSG_ECHEC)
      setChargement(false)
      return
    }
    setSujets(infosReponse.data)
    setEchecs(echecsReponse.data)
    setChargement(false)
  }

  useEffect(() => {
    charger()
  }, [])

  async function gererMasquage(sujet) {
    setErreurMasquage('')
    setMasquageEnCours(sujet.id)
    // `.select()` indispensable : sans lui, un blocage RLS silencieux
    // (0 ligne concernée) ne remonte aucune erreur.
    const { data, error } = await supabase
      .from('Infos')
      .update({ masque: !sujet.masque })
      .eq('id', sujet.id)
      .select()
    if (error || !data || data.length === 0) {
      setErreurMasquage(MSG_ECHEC)
      setMasquageEnCours(null)
      return
    }
    setSujets((precedent) =>
      precedent.map((s) => (s.id === sujet.id ? { ...s, masque: !s.masque } : s)),
    )
    setMasquageEnCours(null)
  }

  return (
    <section>
      <h2>Veille</h2>
      {chargement && <p role="status">Chargement…</p>}
      {!chargement && erreur && (
        <div>
          <p role="alert">{erreur}</p>
          <button type="button" onClick={charger} aria-label="Réessayer de charger la veille">
            Réessayer
          </button>
        </div>
      )}
      {!chargement && !erreur && (
        <>
          <h3>Sujets récents (48 h)</h3>
          {erreurMasquage && <p role="alert">{erreurMasquage}</p>}
          {sujets.length === 0 ? (
            <p>Aucun sujet récent.</p>
          ) : (
            <ul>
              {sujets.map((s) => {
                const titre = s.titre_recomposé || '(Sans titre)'
                return (
                  <li key={s.id}>
                    {titre} — score {s.score ?? '—'}
                    {s.masque && <strong> (masqué)</strong>}{' '}
                    <button
                      type="button"
                      onClick={() => gererMasquage(s)}
                      disabled={masquageEnCours === s.id}
                      aria-label={`${s.masque ? 'Démasquer' : 'Masquer'} le sujet ${titre}`}
                    >
                      {s.masque ? 'Démasquer' : 'Masquer'}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <h3>Échecs de scraping</h3>
          {echecs.length === 0 ? (
            <p>Aucun échec de scraping.</p>
          ) : (
            <ul>
              {echecs.map((e) => (
                <li key={e.id}>
                  {e.titre || '(Sans titre)'} — {e.tentatives_scraping} tentative(s)
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}

function SectionUtilisateurs() {
  const [lignes, setLignes] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  async function charger() {
    setErreur('')
    setChargement(true)
    const [profilsReponse, categoriesReponse, publicationsReponse] = await Promise.all([
      supabase.from('profiles').select('id, email, nom, prenom'),
      supabase.from('profils_categories').select('user_id'),
      supabase.from('Publications').select('user_id, statut'),
    ])
    if (profilsReponse.error || categoriesReponse.error || publicationsReponse.error) {
      setErreur(MSG_ECHEC)
      setChargement(false)
      return
    }

    const utilisateursAvecCategorie = new Set(categoriesReponse.data.map((c) => c.user_id))
    const compteursParUtilisateur = new Map()
    for (const pub of publicationsReponse.data) {
      const compteurs = compteursParUtilisateur.get(pub.user_id) ?? {
        Brouillon: 0,
        Enregistré: 0,
        Publié: 0,
      }
      if (pub.statut in compteurs) compteurs[pub.statut] += 1
      compteursParUtilisateur.set(pub.user_id, compteurs)
    }

    const donnees = profilsReponse.data.map((p) => ({
      id: p.id,
      email: p.email,
      nomComplet: [p.prenom, p.nom].filter(Boolean).join(' ') || '—',
      onboardingComplet: Boolean(p.nom && p.prenom && utilisateursAvecCategorie.has(p.id)),
      compteurs: compteursParUtilisateur.get(p.id) ?? { Brouillon: 0, Enregistré: 0, Publié: 0 },
    }))
    setLignes(donnees)
    setChargement(false)
  }

  useEffect(() => {
    charger()
  }, [])

  return (
    <section>
      <h2>Utilisateurs</h2>
      {chargement && <p role="status">Chargement…</p>}
      {!chargement && erreur && (
        <div>
          <p role="alert">{erreur}</p>
          <button type="button" onClick={charger} aria-label="Réessayer de charger les utilisateurs">
            Réessayer
          </button>
        </div>
      )}
      {!chargement && !erreur && (
        <>
          {lignes.length === 0 ? (
            <p>Aucun utilisateur.</p>
          ) : (
            <div className="tableau-admin-conteneur">
              <table>
                <caption className="visually-hidden">
                  Liste des utilisateurs, leur onboarding et leurs publications
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Email</th>
                    <th scope="col">Nom</th>
                    <th scope="col">Onboarding</th>
                    <th scope="col">Brouillons</th>
                    <th scope="col">Enregistrés</th>
                    <th scope="col">Publiés</th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((l) => (
                    <tr key={l.id}>
                      <td>{l.email}</td>
                      <td>{l.nomComplet}</td>
                      <td>{l.onboardingComplet ? 'Complet' : 'Incomplet'}</td>
                      <td>{l.compteurs.Brouillon}</td>
                      <td>{l.compteurs['Enregistré']}</td>
                      <td>{l.compteurs['Publié']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default function Admin({ onAllerAccueil, onRetour }) {
  const [autorisationVerifiee, setAutorisationVerifiee] = useState(false)
  const [autorise, setAutorise] = useState(false)

  useEffect(() => {
    let annule = false
    async function verifier() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (annule) return
      setAutorise(estAdmin(user?.email))
      setAutorisationVerifiee(true)
    }
    verifier()
    return () => {
      annule = true
    }
  }, [])

  useEffect(() => {
    if (autorisationVerifiee && !autorise) {
      onRetour()
    }
  }, [autorisationVerifiee, autorise, onRetour])

  // Rien ne se dessine tant que l'autorisation n'est pas confirmée — et rien
  // du tout si elle est refusée (redirection immédiate ci-dessus).
  if (!autorisationVerifiee || !autorise) {
    return null
  }

  return (
    <main>
      <LogoReachly onNaviguer={onAllerAccueil} />
      <header>
        <h1>Administration</h1>
        <button type="button" onClick={onRetour}>
          Retour au tableau de bord
        </button>
      </header>

      {/* Regroupement identique à celui de l'écran Préférences ("Filtrage de
          vos actus" / "Personnalisation de vos posts") — même vocabulaire,
          côté admin cette fois. */}
      <section aria-labelledby="titre-admin-filtrage-veille">
        <h2 id="titre-admin-filtrage-veille">Filtrage de la veille</h2>
        <SectionCategories />
        <SectionSources />
      </section>

      <section aria-labelledby="titre-admin-personnalisation-posts">
        <h2 id="titre-admin-personnalisation-posts">Personnalisation des posts</h2>
        <SectionTonalites />
      </section>

      <SectionVeille />
      <SectionUtilisateurs />
    </main>
  )
}
