import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Configuration Supabase manquante : renseignez VITE_SUPABASE_URL et ' +
      'VITE_SUPABASE_ANON_KEY dans .env (voir .env.example).',
  )
}

// « Se souvenir de moi » (écran de connexion) : coché (par défaut) garde le
// comportement historique — session en localStorage, persistante entre les
// visites. Décoché bascule sur sessionStorage — la session s'efface à la
// fermeture du navigateur. Le choix doit être fixé juste avant l'appel à
// signInWithPassword (voir Connexion.jsx), car c'est à ce moment que
// supabase-js écrit la session via ce stockage.
let seSouvenir = true

export function definirSeSouvenir(valeur) {
  seSouvenir = valeur
}

const stockageSession = {
  getItem: (cle) => localStorage.getItem(cle) ?? sessionStorage.getItem(cle),
  setItem: (cle, valeur) => {
    if (seSouvenir) {
      localStorage.setItem(cle, valeur)
      sessionStorage.removeItem(cle)
    } else {
      sessionStorage.setItem(cle, valeur)
      localStorage.removeItem(cle)
    }
  },
  removeItem: (cle) => {
    localStorage.removeItem(cle)
    sessionStorage.removeItem(cle)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: stockageSession },
})
