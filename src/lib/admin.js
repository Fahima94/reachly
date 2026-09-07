// Liste fermée (ticket 14) — pas de table de rôles pour 3 personnes. À
// modifier ici par un développeur si elle doit changer.
export const EMAILS_ADMIN = [
  'francoisba@gmail.com',
  'horizonsdatas@gmail.com',
  'fguernalec@gmail.com',
]

export function estAdmin(email) {
  return Boolean(email) && EMAILS_ADMIN.includes(email)
}
