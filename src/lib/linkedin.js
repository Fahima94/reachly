// Le navigateur auto-remplit parfois le champ "Profil LinkedIn" avec le seul
// protocole ("https://"), sans le reste de l'URL — déclenché par
// `autoComplete="url"` sur le champ. Une valeur ainsi tronquée n'est pas
// utilisable (ni comme lien, ni comme information) : on la traite comme
// vide avant tout enregistrement.
const PROTOCOLE_SEUL = /^https?:\/\/$/i

export function linkedinValide(valeur) {
  const trim = (valeur ?? '').trim()
  if (!trim || PROTOCOLE_SEUL.test(trim)) return null
  return trim
}
