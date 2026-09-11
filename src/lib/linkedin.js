// Le navigateur auto-remplit parfois le champ "Profil LinkedIn" avec le seul
// protocole ("https://"), sans le reste de l'URL — déclenché par
// `autoComplete="url"` sur le champ. Une valeur ainsi tronquée n'est pas
// utilisable (ni comme lien, ni comme information) : on la traite comme
// vide avant tout enregistrement.
const PROTOCOLE_SEUL = /^https?:\/\/$/i

// Le champ n'accepte qu'un vrai lien de profil LinkedIn — pas n'importe quel
// texte (constaté en test réel : "a propos de vous et exemples" enregistré
// tel quel, faute de validation). www./locale (fr., en-ie....) optionnels,
// http ou https, un chemin après le domaine.
const LIEN_LINKEDIN = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/.+/i

export function linkedinValide(valeur) {
  const trim = (valeur ?? '').trim()
  if (!trim || PROTOCOLE_SEUL.test(trim) || !LIEN_LINKEDIN.test(trim)) return null
  return trim
}
