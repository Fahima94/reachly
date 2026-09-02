export const PASSWORD_RULES = [
  { id: 'length', label: 'Au moins 8 caractères', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'Une majuscule', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'Une minuscule', test: (v) => /[a-z]/.test(v) },
  { id: 'digit', label: 'Un chiffre', test: (v) => /\d/.test(v) },
]

export function passwordRespecteLesRegles(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password))
}
