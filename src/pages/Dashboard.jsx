import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import BoutonDeconnexion from '../components/BoutonDeconnexion.jsx'
import GenerationPost from '../components/GenerationPost.jsx'
import LogoReachly from '../components/LogoReachly.jsx'
import { estAdmin } from '../lib/admin.js'

const FENETRE_MS = 24 * 60 * 60 * 1000
const LIEN_VALIDE = /^https?:\/\//i
const RESUME_MAX = 220

const VOIX_NARRATIVES = [
  { valeur: 'je_masculin', libelle: 'Je (masculin)' },
  { valeur: 'je_feminin', libelle: 'Je (féminin)' },
  { valeur: 'nous', libelle: 'Nous (1ʳᵉ personne du pluriel)' },
]

// Une couleur par catégorie, sur le tableau de bord uniquement — pour
// distinguer les catégories d'un coup d'œil sur une carte qui en affiche
// plusieurs. Assignation fixe pour les 12 catégories "thème" connues du
// cadrage ; repli déterministe (hash du nom) pour toute catégorie ajoutée
// depuis l'interface admin (ticket 14), afin qu'elle ait toujours une
// couleur cohérente avec la palette plutôt que rien.
const PALETTE_CATEGORIES = [
  { fond: '#f3e8ff', texte: '#6b21a8' }, // mauve
  { fond: '#e0f2fe', texte: '#075985' }, // bleu ciel
  { fond: '#ecfccb', texte: '#3f6212' }, // vert clair
  { fond: '#fee2e2', texte: '#991b1b' }, // rouge
  { fond: '#e0e7ff', texte: '#3730a3' }, // indigo
  { fond: '#ccfbf1', texte: '#115e59' }, // turquoise
  { fond: '#fef3c7', texte: '#92400e' }, // ambre
  { fond: '#fae8ff', texte: '#86198f' }, // fuchsia
  { fond: '#cffafe', texte: '#155e75' }, // cyan
  { fond: '#fce7f3', texte: '#9d174d' }, // rose
  { fond: '#ffedd5', texte: '#9a3412' }, // orange
  { fond: '#e2e8f0', texte: '#334155' }, // ardoise
]

const COULEUR_PAR_CATEGORIE = {
  'Agents IA': PALETTE_CATEGORIES[0], // mauve
  Automatisation: PALETTE_CATEGORIES[10], // orange
  'Cas d’usage': PALETTE_CATEGORIES[9], // rose
  Cloud: PALETTE_CATEGORIES[1], // bleu ciel
  Cybersécurité: PALETTE_CATEGORIES[3], // rouge
  Data: PALETTE_CATEGORIES[4], // indigo
  Développement: PALETTE_CATEGORIES[5], // turquoise
  'Emploi Tech': PALETTE_CATEGORIES[6], // ambre
  'IA générative': PALETTE_CATEGORIES[7], // fuchsia
  'Outils IA': PALETTE_CATEGORIES[8], // cyan
  Productivité: PALETTE_CATEGORIES[2], // vert clair
  'Régulation IA': PALETTE_CATEGORIES[11], // ardoise
}

function couleurCategorie(nom) {
  if (COULEUR_PAR_CATEGORIE[nom]) return COULEUR_PAR_CATEGORIE[nom]
  let hash = 0
  for (let i = 0; i < nom.length; i++) hash = (hash * 31 + nom.charCodeAt(i)) >>> 0
  return PALETTE_CATEGORIES[hash % PALETTE_CATEGORIES.length]
}

function classeScore(score) {
  if (score >= 80) return 'badge-score--haut'
  if (score >= 60) return 'badge-score--moyen'
  return 'badge-score--bas'
}

function anciennete(dateIso) {
  const ecoule = Date.now() - new Date(dateIso).getTime()
  const minutes = Math.floor(ecoule / 60000)
  if (minutes < 60) return `il y a ${Math.max(minutes, 1)} min`
  return `il y a ${Math.floor(minutes / 60)} h`
}

// Fraîcheur en dégradé (0 à 3 flammes) plutôt qu'un simple seuil — la
// fraîcheur pèse 30 % du score (cadrage), ça mérite un signal visuel qui
// suit vraiment la récence : < 3 h (3), < 6 h (2), < 12 h (1), sinon rien.
function niveauFlammes(dateIso) {
  const heuresEcoulees = (Date.now() - new Date(dateIso).getTime()) / 3600000
  if (heuresEcoulees < 3) return 3
  if (heuresEcoulees < 6) return 2
  if (heuresEcoulees < 12) return 1
  return 0
}

const LIBELLE_FLAMMES = {
  3: 'Sujet très frais, moins de 3 h',
  2: 'Sujet frais, moins de 6 h',
  1: 'Sujet récent, moins de 12 h',
}

// `Infos.contenu` est le contenu recomposé complet, pas un résumé : on le
// tronque pour la carte.
function resumer(texte) {
  const t = (texte ?? '').replace(/\s+/g, ' ').trim()
  return t.length > RESUME_MAX ? `${t.slice(0, RESUME_MAX).trimEnd()}…` : t
}

export default function Dashboard({
  onDeconnexionReussie,
  onRelancerOnboarding,
  onModifierPreferences,
  onOuvrirAdmin,
  onOuvrirPublications,
  onOuvrirCompte,
}) {
  // chargement | incomplet | pret | vide | erreur
  const [etat, setEtat] = useState('chargement')
  const [sujets, setSujets] = useState([])
  const [aucuneCorrespondance, setAucuneCorrespondance] = useState(false)
  const [userId, setUserId] = useState(null)
  const [tonaliteDefinie, setTonaliteDefinie] = useState(false)
  const [emailAdmin, setEmailAdmin] = useState(false)
  const [initiales, setInitiales] = useState('')
  const [nomComplet, setNomComplet] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [avatarEnCours, setAvatarEnCours] = useState(false)
  const [erreurAvatar, setErreurAvatar] = useState('')
  const [menuProfilOuvert, setMenuProfilOuvert] = useState(false)
  const menuProfilRef = useRef(null)
  const [categoriesSelectionnees, setCategoriesSelectionnees] = useState(() => new Set())
  const [tonaliteLabel, setTonaliteLabel] = useState('')
  const [voixLabel, setVoixLabel] = useState('')

  const charger = useCallback(async () => {
    setEtat('chargement')
    setCategoriesSelectionnees(new Set())
    try {
      const {
        data: { user },
        error: erreurUser,
      } = await supabase.auth.getUser()
      if (erreurUser || !user) {
        setEtat('erreur')
        return
      }

      // Onboarding complet = nom + prénom renseignés et au moins une catégorie.
      const [{ data: profil, error: erreurProfil }, { data: cats, error: erreurCats }] =
        await Promise.all([
          supabase
            .from('profiles')
            .select('nom, prenom, avatar_url, "Tonalité_défaut", voix_narrative')
            .eq('id', user.id)
            .maybeSingle(),
          supabase.from('profils_categories').select('category_id').eq('user_id', user.id),
        ])
      if (erreurProfil || erreurCats) {
        setEtat('erreur')
        return
      }

      const categoriesUtilisateur = (cats ?? []).map((c) => c.category_id)
      if (!profil?.nom || !profil?.prenom || categoriesUtilisateur.length === 0) {
        setEtat('incomplet')
        return
      }

      setUserId(user.id)
      setTonaliteDefinie(Boolean(profil['Tonalité_défaut']))
      setEmailAdmin(estAdmin(user.email))
      setInitiales(`${profil.prenom[0]}${profil.nom[0]}`.toUpperCase())
      setNomComplet(`${profil.prenom} ${profil.nom}`)
      setAvatarUrl(profil.avatar_url || null)
      setVoixLabel(
        VOIX_NARRATIVES.find((v) => v.valeur === profil.voix_narrative)?.libelle ?? '',
      )

      if (profil['Tonalité_défaut']) {
        const { data: tonalite } = await supabase
          .from('Tonalités')
          .select('"Visée de la publication"')
          .eq('id', profil['Tonalité_défaut'])
          .maybeSingle()
        setTonaliteLabel(tonalite?.['Visée de la publication'] ?? '')
      } else {
        setTonaliteLabel('')
      }

      // Candidats : scorés, créés dans les dernières 24 h glissantes, non masqués
      // par un admin (ticket 14), du meilleur score au moins bon. (La colonne
      // `publier` n'est pas utilisée.)
      const seuil = new Date(Date.now() - FENETRE_MS).toISOString()
      const { data: candidats, error: erreurInfos } = await supabase
        .from('Infos')
        .select('id, titre_recomposé, contenu, article, lien, score, created_at, sujet_veille_id')
        .not('score', 'is', null)
        .eq('masque', false)
        .gte('created_at', seuil)
        .order('score', { ascending: false })
        .limit(50)
      if (erreurInfos) {
        setEtat('erreur')
        return
      }

      if (!candidats || candidats.length === 0) {
        setSujets([])
        setAucuneCorrespondance(false)
        setEtat('vide')
        return
      }

      // Passe 1 : quels candidats correspondent aux préférences ?
      const { data: liensPref, error: erreurLiensPref } = await supabase
        .from('infos_categories')
        .select('info_id')
        .in('info_id', candidats.map((c) => c.id))
        .in('category_id', categoriesUtilisateur)
      if (erreurLiensPref) {
        setEtat('erreur')
        return
      }
      const infosDansPreferences = new Set((liensPref ?? []).map((l) => l.info_id))

      const dans = candidats.filter((c) => infosDansPreferences.has(c.id))
      const hors = candidats.filter((c) => !infosDansPreferences.has(c.id))
      // Passe 2 : compléter jusqu'à 5 avec les mieux scorés hors préférences.
      const retenus = [...dans, ...hors].slice(0, 5)
      const idsRetenus = retenus.map((c) => c.id)
      const idsSujetsVeille = retenus.map((c) => c.sujet_veille_id).filter(Boolean)

      // Catégories et source des sujets retenus (requêtes séparées, pas d'embed).
      const [liensCat, sujetsVeille] = await Promise.all([
        supabase.from('infos_categories').select('info_id, category_id').in('info_id', idsRetenus),
        idsSujetsVeille.length
          ? supabase.from('Sujets_veille').select('id, source_id').in('id', idsSujetsVeille)
          : Promise.resolve({ data: [], error: null }),
      ])
      if (liensCat.error || sujetsVeille.error) {
        setEtat('erreur')
        return
      }

      const idsCategories = [...new Set((liensCat.data ?? []).map((l) => l.category_id))]
      const idsSources = [
        ...new Set((sujetsVeille.data ?? []).map((s) => s.source_id).filter(Boolean)),
      ]

      const [categories, sources] = await Promise.all([
        idsCategories.length
          ? supabase.from('Catégories').select('id, nom').in('id', idsCategories)
          : Promise.resolve({ data: [], error: null }),
        idsSources.length
          ? supabase.from('Sources').select('id, nom').in('id', idsSources)
          : Promise.resolve({ data: [], error: null }),
      ])
      if (categories.error || sources.error) {
        setEtat('erreur')
        return
      }

      const nomCategorie = new Map((categories.data ?? []).map((c) => [c.id, c.nom]))
      const sourceParSujetVeille = new Map(
        (sujetsVeille.data ?? []).map((s) => [s.id, s.source_id]),
      )
      const nomSource = new Map((sources.data ?? []).map((s) => [s.id, s.nom]))
      const categoriesParInfo = new Map()
      for (const lien of liensCat.data ?? []) {
        const liste = categoriesParInfo.get(lien.info_id) ?? []
        const nom = nomCategorie.get(lien.category_id)
        if (nom) liste.push(nom)
        categoriesParInfo.set(lien.info_id, liste)
      }

      const enrichis = retenus.map((c) => ({
        id: c.id,
        titre: c.titre_recomposé || '(Sans titre)',
        resume: resumer(c.contenu || c.article),
        lien: LIEN_VALIDE.test(c.lien ?? '') ? c.lien : null,
        score: Math.round(c.score * 10),
        anciennete: anciennete(c.created_at),
        flammes: niveauFlammes(c.created_at),
        categories: categoriesParInfo.get(c.id) ?? [],
        source: nomSource.get(sourceParSujetVeille.get(c.sujet_veille_id)) ?? null,
        horsPreferences: !infosDansPreferences.has(c.id),
      }))

      setSujets(enrichis)
      setAucuneCorrespondance(dans.length === 0)
      setEtat('pret')
    } catch {
      setEtat('erreur')
    }
  }, [])

  useEffect(() => {
    charger()
  }, [charger])

  // Photo de profil : chemin `{userId}/avatar-<horodatage>.<ext>` — le
  // premier segment doit correspondre à `auth.uid()` (policies RLS du bucket
  // `avatars`). L'ancienne photo n'est pas supprimée (pas demandé), juste
  // remplacée dans `profiles.avatar_url`.
  async function gererChoixAvatar(evenement) {
    const fichier = evenement.target.files?.[0]
    evenement.target.value = ''
    if (!fichier || !userId) return

    setErreurAvatar('')
    setAvatarEnCours(true)
    try {
      const extension = fichier.name.split('.').pop() || 'jpg'
      const chemin = `${userId}/avatar-${Date.now()}.${extension}`

      const { error: erreurUpload } = await supabase.storage
        .from('avatars')
        .upload(chemin, fichier, { contentType: fichier.type })
      if (erreurUpload) {
        setErreurAvatar("L'envoi de la photo a échoué. Vérifiez votre connexion et réessayez.")
        setAvatarEnCours(false)
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(chemin)

      const { error: erreurProfil } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
      if (erreurProfil) {
        setErreurAvatar("L'envoi de la photo a échoué. Vérifiez votre connexion et réessayez.")
        setAvatarEnCours(false)
        return
      }

      setAvatarUrl(publicUrl)
      setAvatarEnCours(false)
    } catch {
      setErreurAvatar("L'envoi de la photo a échoué. Vérifiez votre connexion et réessayez.")
      setAvatarEnCours(false)
    }
  }

  useEffect(() => {
    if (etat === 'incomplet') {
      onRelancerOnboarding()
    }
  }, [etat, onRelancerOnboarding])

  // Menu du profil : se ferme au clic en dehors ou à Échap — motif déjà
  // utilisé pour la modale de publication, allégé ici (pas de piège du
  // focus complet, ce n'est pas une boîte de dialogue bloquante).
  useEffect(() => {
    if (!menuProfilOuvert) return

    function gererClicExterieur(evenement) {
      if (!menuProfilRef.current?.contains(evenement.target)) {
        setMenuProfilOuvert(false)
      }
    }
    function gererClavier(evenement) {
      if (evenement.key === 'Escape') setMenuProfilOuvert(false)
    }

    document.addEventListener('mousedown', gererClicExterieur)
    document.addEventListener('keydown', gererClavier)
    return () => {
      document.removeEventListener('mousedown', gererClicExterieur)
      document.removeEventListener('keydown', gererClavier)
    }
  }, [menuProfilOuvert])

  if (etat === 'incomplet') {
    return (
      <main>
        <p role="status">Votre profil est incomplet — redirection vers l'onboarding…</p>
      </main>
    )
  }

  // Filtre par catégorie (confort de lecture), en puces à bascule
  // multi-sélection — purement côté client, sur les 5 sujets déjà chargés :
  // les sujets qui ont au moins une catégorie sélectionnée remontent en
  // tête, le reste garde son ordre (tri stable), pas de nouvel appel.
  const categoriesDisponibles = [...new Set(sujets.flatMap((s) => s.categories))].sort((a, b) =>
    a.localeCompare(b, 'fr'),
  )
  const correspondSelection = (sujet) =>
    sujet.categories.some((c) => categoriesSelectionnees.has(c))
  const sujetsAffiches =
    categoriesSelectionnees.size > 0
      ? [...sujets].sort(
          (a, b) => Number(!correspondSelection(a)) - Number(!correspondSelection(b)),
        )
      : sujets

  function basculerCategorieTri(categorie) {
    setCategoriesSelectionnees((precedent) => {
      const suivant = new Set(precedent)
      if (suivant.has(categorie)) suivant.delete(categorie)
      else suivant.add(categorie)
      return suivant
    })
  }

  return (
    <main>
      <div className="barre-superieure">
        <LogoReachly />
        <div className="profil-entete">
          <div className="conteneur-avatar" ref={menuProfilRef}>
            <button
              type="button"
              className="declencheur-menu-profil"
              onClick={() => setMenuProfilOuvert((ouvert) => !ouvert)}
              aria-haspopup="true"
              aria-expanded={menuProfilOuvert}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="pastille-profil" />
              ) : (
                initiales && (
                  <span className="pastille-profil" aria-hidden="true">
                    {initiales}
                  </span>
                )
              )}
              <span className="visually-hidden">
                Menu du profil{nomComplet ? ` de ${nomComplet}` : ''}
              </span>
            </button>
            <label className="bouton-ajout-avatar">
              <span className="visually-hidden">Changer ma photo de profil</span>
              <span aria-hidden="true">{avatarEnCours ? '…' : '+'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={gererChoixAvatar}
                disabled={avatarEnCours}
                className="visually-hidden"
              />
            </label>
            {menuProfilOuvert && (
              <div className="menu-profil" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="element-menu-profil"
                  onClick={() => {
                    setMenuProfilOuvert(false)
                    onOuvrirPublications()
                  }}
                >
                  Mes publications
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="element-menu-profil"
                  onClick={() => {
                    setMenuProfilOuvert(false)
                    onModifierPreferences()
                  }}
                >
                  Mes préférences
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="element-menu-profil"
                  onClick={() => {
                    setMenuProfilOuvert(false)
                    onOuvrirCompte()
                  }}
                >
                  Mon compte
                </button>
                {/* Réservé aux 3 comptes admin (lib/admin.js) — reste utile pour les
                    tests, mais n'a plus sa place dans les actions courantes d'une
                    personne qui utilise juste l'app. */}
                {emailAdmin && (
                  <button
                    type="button"
                    role="menuitem"
                    className="element-menu-profil"
                    onClick={() => {
                      setMenuProfilOuvert(false)
                      onRelancerOnboarding()
                    }}
                  >
                    Relancer l'onboarding
                  </button>
                )}
              </div>
            )}
          </div>
          <BoutonDeconnexion onDeconnecte={onDeconnexionReussie} className="bouton-deconnexion" />
        </div>
      </div>
      {erreurAvatar && <p role="alert">{erreurAvatar}</p>}
      <header>
        <h1>Vos sujets du jour</h1>
      </header>

      {etat === 'chargement' && <p role="status">Chargement des sujets…</p>}

      {etat === 'erreur' && (
        <div>
          <p role="alert" className="erreur-globale">
            Impossible de récupérer les sujets. Vérifiez votre connexion et réessayez.
          </p>
          <button type="button" onClick={charger}>
            Réessayer
          </button>
        </div>
      )}

      {etat === 'vide' && (
        <div>
          <p role="status">
            Aucun sujet disponible pour le moment. La veille tourne en continu — revenez d'ici
            quelques heures.
          </p>
          <button type="button" onClick={charger}>
            Actualiser
          </button>
        </div>
      )}

      {etat === 'pret' && (
        <>
          {categoriesDisponibles.length > 1 && (
            <details className="tri-sujets">
              <summary>
                Filtrer par catégorie
                {categoriesSelectionnees.size > 0 && ` (${categoriesSelectionnees.size})`}
              </summary>
              <div className="tri-categories" role="group" aria-label="Filtrer par catégorie">
                {categoriesDisponibles.map((categorie) => {
                  const couleur = couleurCategorie(categorie)
                  const selectionnee = categoriesSelectionnees.has(categorie)
                  return (
                    <button
                      key={categorie}
                      type="button"
                      className="puce-tri-categorie"
                      style={selectionnee ? { background: couleur.fond, color: couleur.texte } : undefined}
                      aria-pressed={selectionnee}
                      onClick={() => basculerCategorieTri(categorie)}
                    >
                      {categorie}
                    </button>
                  )
                })}
              </div>
            </details>
          )}

          {aucuneCorrespondance && (
            <div>
              <p role="status">
                Aucun sujet ne correspond à vos préférences dans les dernières 24 heures. Voici les
                sujets les plus marquants, toutes catégories confondues.
              </p>
              <button type="button" onClick={onModifierPreferences}>
                Ajuster mes préférences
              </button>
            </div>
          )}

          <ol>
            {sujetsAffiches.map((sujet) => {
              return (
                <li key={sujet.id}>
                  <article>
                    <p>
                      <span className={`badge-score ${classeScore(sujet.score)}`}>
                        {sujet.score}%
                      </span>
                      {sujet.flammes > 0 && (
                        <span className="indicateur-chaud" title={LIBELLE_FLAMMES[sujet.flammes]}>
                          <span aria-hidden="true">{'🔥'.repeat(sujet.flammes)}</span>
                          <span className="visually-hidden">{LIBELLE_FLAMMES[sujet.flammes]}</span>
                        </span>
                      )}
                      <span className="meta-discrete"> {sujet.anciennete}</span>
                    </p>
                    <h2>{sujet.titre}</h2>
                    {sujet.horsPreferences && (
                      <p>
                        <strong>Hors de vos préférences</strong>
                      </p>
                    )}
                    {sujet.resume && <p>{sujet.resume}</p>}
                    {sujet.categories.length > 0 && (
                      <p className="etiquettes-categories">
                        {sujet.categories.map((categorie) => {
                          const couleur = couleurCategorie(categorie)
                          return (
                            <span
                              key={categorie}
                              className="etiquette-categorie"
                              style={{ background: couleur.fond, color: couleur.texte }}
                            >
                              {categorie}
                            </span>
                          )
                        })}
                      </p>
                    )}
                    {sujet.lien && (
                      <p>
                        <a href={sujet.lien} target="_blank" rel="noopener noreferrer">
                          Voir la source
                        </a>
                      </p>
                    )}
                    <GenerationPost
                      sujetId={sujet.id}
                      userId={userId}
                      tonaliteDefinie={tonaliteDefinie}
                      tonaliteLabel={tonaliteLabel}
                      voixLabel={voixLabel}
                      onModifierPreferences={onModifierPreferences}
                    />
                  </article>
                </li>
              )
            })}
          </ol>
        </>
      )}

      {emailAdmin && (
        <footer className="pied-de-page">
          <button type="button" className="bouton-discret" onClick={onOuvrirAdmin}>
            Administration
          </button>
        </footer>
      )}
    </main>
  )
}
