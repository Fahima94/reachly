import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

export default function Identite({ onEtapeSuivante }) {
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [chargementInitial, setChargementInitial] = useState(true)
  const [erreurChargement, setErreurChargement] = useState('')
  const [statut, setStatut] = useState('idle') // idle | chargement
  const [erreurGlobale, setErreurGlobale] = useState('')
  const [erreurPrenom, setErreurPrenom] = useState('')
  const [erreurNom, setErreurNom] = useState('')

  const enCours = statut === 'chargement'

  async function chargerProfil() {
    setErreurChargement('')
    setChargementInitial(true)
    try {
      const {
        data: { user },
        error: erreurUtilisateur,
      } = await supabase.auth.getUser()

      if (erreurUtilisateur || !user) {
        setErreurChargement('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
        setChargementInitial(false)
        return
      }

      // Pré-remplissage : lit l'état déjà en base (relance de l'onboarding).
      // Un premier onboarding n'a pas encore de ligne profiles → data null.
      const { data, error } = await supabase
        .from('profiles')
        .select('prenom, nom')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        setErreurChargement('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
        setChargementInitial(false)
        return
      }

      if (data) {
        setPrenom(data.prenom ?? '')
        setNom(data.nom ?? '')
      }
      setChargementInitial(false)
    } catch {
      setErreurChargement('Le chargement a échoué. Vérifiez votre connexion et réessayez.')
      setChargementInitial(false)
    }
  }

  useEffect(() => {
    chargerProfil()
  }, [])

  async function gererValidation(evenement) {
    evenement.preventDefault()
    setErreurGlobale('')
    setErreurPrenom('')
    setErreurNom('')

    // Champ vide
    if (!prenom.trim() || !nom.trim()) {
      if (!prenom.trim()) setErreurPrenom('Renseignez votre prénom.')
      if (!nom.trim()) setErreurNom('Renseignez votre nom.')
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

      // Première écriture dans profiles pour cette personne : upsert (pas de
      // ligne existante), on en profite pour y copier l'email déjà connu.
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        prenom: prenom.trim(),
        nom: nom.trim(),
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

  return (
    <main>
      <p>Étape 1 sur 5</p>
      <p>Ces informations nous aident à mieux orienter votre veille et vos posts.</p>
      <h1>Comment vous appelez-vous ?</h1>

      {chargementInitial && (
        <p role="status">Chargement de vos réponses…</p>
      )}

      {!chargementInitial && erreurChargement && (
        <div>
          <p role="alert" className="erreur-globale">
            {erreurChargement}
          </p>
          <button type="button" onClick={chargerProfil}>
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
            <label htmlFor="prenom">Prénom</label>
            <input
              id="prenom"
              name="prenom"
              type="text"
              autoComplete="given-name"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              aria-describedby={erreurPrenom ? 'prenom-erreur' : undefined}
              aria-invalid={erreurPrenom ? 'true' : 'false'}
            />
            {erreurPrenom && (
              <p id="prenom-erreur" role="alert">
                {erreurPrenom}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="nom">Nom</label>
            <input
              id="nom"
              name="nom"
              type="text"
              autoComplete="family-name"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              aria-describedby={erreurNom ? 'nom-erreur' : undefined}
              aria-invalid={erreurNom ? 'true' : 'false'}
            />
            {erreurNom && (
              <p id="nom-erreur" role="alert">
                {erreurNom}
              </p>
            )}
          </div>

          <button type="submit" disabled={enCours} aria-busy={enCours}>
            {enCours ? 'Enregistrement en cours…' : 'Suivant'}
          </button>
        </form>
      )}
    </main>
  )
}
