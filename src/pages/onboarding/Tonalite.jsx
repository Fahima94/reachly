import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

export default function Tonalite({ onEtapeSuivante }) {
  const [tonalites, setTonalites] = useState([])
  const [tonaliteChoisie, setTonaliteChoisie] = useState('')
  const [chargementListe, setChargementListe] = useState(true)
  const [erreurListe, setErreurListe] = useState('')
  const [statut, setStatut] = useState('idle') // idle | chargement
  const [erreurGlobale, setErreurGlobale] = useState('')
  const [erreurTonalite, setErreurTonalite] = useState('')

  const enCours = statut === 'chargement'

  async function charger() {
    setErreurListe('')
    setChargementListe(true)
    try {
      const { data, error } = await supabase
        .from('Tonalités')
        .select('id, "Visée de la publication", descriptif')
        .order('Visée de la publication')

      if (error) {
        setErreurListe('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
        setChargementListe(false)
        return
      }

      setTonalites(data)

      // Pré-sélection : lit la tonalité par défaut déjà en base (relance de
      // l'onboarding). Premier onboarding → aucune, rien de coché.
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profil, error: erreurProfil } = await supabase
          .from('profiles')
          .select('Tonalité_défaut')
          .eq('id', user.id)
          .maybeSingle()

        if (erreurProfil) {
          setErreurListe('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
          setChargementListe(false)
          return
        }

        if (profil?.Tonalité_défaut) {
          setTonaliteChoisie(profil.Tonalité_défaut)
        }
      }

      setChargementListe(false)
    } catch {
      setErreurListe('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
      setChargementListe(false)
    }
  }

  useEffect(() => {
    charger()
  }, [])

  async function gererValidation(evenement) {
    evenement.preventDefault()
    setErreurGlobale('')
    setErreurTonalite('')

    if (!tonaliteChoisie) {
      setErreurTonalite('Choisissez une tonalité.')
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

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, Tonalité_défaut: tonaliteChoisie })

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
      <p>Étape 4 sur 5</p>
      <p>Ces informations nous aident à mieux orienter votre veille et vos posts.</p>
      <h1>Votre tonalité par défaut</h1>

      {chargementListe && <p role="status">Chargement de vos réponses…</p>}

      {!chargementListe && erreurListe && (
        <div>
          <p role="alert" className="erreur-globale">
            {erreurListe}
          </p>
          <button type="button" onClick={charger}>
            Réessayer
          </button>
        </div>
      )}

      {!chargementListe && !erreurListe && (
        <form onSubmit={gererValidation} noValidate>
          {erreurGlobale && (
            <p role="alert" className="erreur-globale">
              {erreurGlobale}
            </p>
          )}

          <fieldset aria-describedby={erreurTonalite ? 'tonalite-erreur' : undefined}>
            <legend>Tonalité</legend>
            {erreurTonalite && (
              <p id="tonalite-erreur" role="alert">
                {erreurTonalite}
              </p>
            )}
            {tonalites.map((tonalite) => (
              <label key={tonalite.id}>
                <input
                  type="radio"
                  name="tonalite"
                  value={tonalite.id}
                  checked={tonaliteChoisie === tonalite.id}
                  onChange={() => setTonaliteChoisie(tonalite.id)}
                />
                {tonalite['Visée de la publication']}
                {tonalite.descriptif && <span> — {tonalite.descriptif}</span>}
              </label>
            ))}
          </fieldset>

          <button type="submit" disabled={enCours} aria-busy={enCours}>
            {enCours ? 'Enregistrement en cours…' : 'Suivant'}
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
