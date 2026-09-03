import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import BoutonDeconnexion from '../components/BoutonDeconnexion.jsx'

const FENETRE_MS = 24 * 60 * 60 * 1000
const LIEN_VALIDE = /^https?:\/\//i
const RESUME_MAX = 220

function anciennete(dateIso) {
  const ecoule = Date.now() - new Date(dateIso).getTime()
  const minutes = Math.floor(ecoule / 60000)
  if (minutes < 60) return `il y a ${Math.max(minutes, 1)} min`
  return `il y a ${Math.floor(minutes / 60)} h`
}

// `Infos.contenu` est le contenu recomposé complet, pas un résumé : on le
// tronque pour la carte.
function resumer(texte) {
  const t = (texte ?? '').replace(/\s+/g, ' ').trim()
  return t.length > RESUME_MAX ? `${t.slice(0, RESUME_MAX).trimEnd()}…` : t
}

export default function Dashboard({ onDeconnexionReussie, onRelancerOnboarding }) {
  // chargement | incomplet | pret | vide | erreur
  const [etat, setEtat] = useState('chargement')
  const [sujets, setSujets] = useState([])
  const [aucuneCorrespondance, setAucuneCorrespondance] = useState(false)

  const charger = useCallback(async () => {
    setEtat('chargement')
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
          supabase.from('profiles').select('nom, prenom').eq('id', user.id).maybeSingle(),
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

      // Candidats : scorés, créés dans les dernières 24 h glissantes,
      // du meilleur score au moins bon. (La colonne `publier` n'est pas utilisée.)
      const seuil = new Date(Date.now() - FENETRE_MS).toISOString()
      const { data: candidats, error: erreurInfos } = await supabase
        .from('Infos')
        .select('id, titre_recomposé, contenu, article, lien, score, created_at, sujet_veille_id')
        .not('score', 'is', null)
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

  useEffect(() => {
    if (etat === 'incomplet') {
      onRelancerOnboarding()
    }
  }, [etat, onRelancerOnboarding])

  if (etat === 'incomplet') {
    return (
      <main>
        <p role="status">Votre profil est incomplet — redirection vers l'onboarding…</p>
      </main>
    )
  }

  return (
    <main>
      <header>
        <h1>Vos sujets du jour</h1>
        <BoutonDeconnexion onDeconnecte={onDeconnexionReussie} />
        <p>
          <button type="button" onClick={onRelancerOnboarding}>
            Relancer l'onboarding
          </button>
        </p>
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
          {aucuneCorrespondance && (
            <div>
              <p role="status">
                Aucun sujet ne correspond à vos préférences dans les dernières 24 heures. Voici les
                sujets les plus marquants, toutes catégories confondues.
              </p>
              <button type="button" onClick={onRelancerOnboarding}>
                Ajuster mes préférences
              </button>
            </div>
          )}

          <ol>
            {sujets.map((sujet, index) => {
              const meta = [
                sujet.categories.length > 0 ? sujet.categories.join(', ') : null,
                sujet.source,
                sujet.anciennete,
              ]
                .filter(Boolean)
                .join(' · ')

              return (
                <li key={sujet.id}>
                  <article>
                    <p>
                      Sujet {index + 1} sur {sujets.length}
                    </p>
                    <h2>{sujet.titre}</h2>
                    <p>Score {sujet.score}/100</p>
                    {sujet.horsPreferences && (
                      <p>
                        <strong>Hors de vos préférences</strong>
                      </p>
                    )}
                    {sujet.resume && <p>{sujet.resume}</p>}
                    <p>{meta}</p>
                    {sujet.lien && (
                      <p>
                        <a href={sujet.lien} target="_blank" rel="noopener noreferrer">
                          Voir la source
                        </a>
                      </p>
                    )}
                  </article>
                </li>
              )
            })}
          </ol>
        </>
      )}
    </main>
  )
}
