import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function BoutonDeconnexion({ onDeconnecte }) {
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')

  async function gererClic() {
    setErreur('')
    setEnCours(true)
    try {
      const { error } = await supabase.auth.signOut()

      // Une session déjà expirée ou invalide n'est pas un échec : la
      // personne est déconnectée dans les deux cas.
      if (error && error.status && error.status >= 500) {
        setErreur('La déconnexion a échoué. Vérifiez votre connexion et réessayez.')
        setEnCours(false)
        return
      }

      onDeconnecte()
    } catch {
      setErreur('La déconnexion a échoué. Vérifiez votre connexion et réessayez.')
      setEnCours(false)
    }
  }

  return (
    <div>
      {erreur && (
        <p role="alert" className="erreur-globale">
          {erreur}
        </p>
      )}
      <button type="button" onClick={gererClic} disabled={enCours} aria-busy={enCours}>
        {enCours ? 'Déconnexion en cours…' : 'Se déconnecter'}
      </button>
    </div>
  )
}
