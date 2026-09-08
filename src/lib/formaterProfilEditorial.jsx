// Transforme le texte du profil éditorial (markdown simple renvoyé par le
// LLM du workflow n8n `Reachly_Profil_Utilisateur` : listes à puces,
// **gras**) en éléments React mis en forme. Jamais de HTML injecté brut
// (pas de `dangerouslySetInnerHTML`) — uniquement des éléments construits
// explicitement, donc rien à assainir côté sécurité.
// Le texte enregistré (et envoyé au prompt de génération de post) commence
// toujours par « Profil éditorial : » — utile pour le LLM qui l'introduit
// dans le prompt, mais redondant à l'affichage puisque la rubrique porte
// déjà ce titre. Retiré uniquement ici, jamais de la valeur enregistrée.
const PREFIXE_REDONDANT = /^profil\s+éditorial\s*:\s*/i

export function formaterProfilEditorial(texte) {
  const lignes = (texte ?? '')
    .split('\n')
    .map((ligne) => ligne.trim())
    .filter(Boolean)

  if (lignes.length > 0 && PREFIXE_REDONDANT.test(lignes[0])) {
    const reste = lignes[0].replace(PREFIXE_REDONDANT, '').trim()
    if (reste) {
      lignes[0] = reste
    } else {
      lignes.shift()
    }
  }

  const blocs = []
  let listeCourante = null

  for (const ligne of lignes) {
    if (ligne.startsWith('- ') || ligne.startsWith('* ')) {
      if (!listeCourante) {
        listeCourante = []
        blocs.push({ type: 'liste', items: listeCourante })
      }
      listeCourante.push(ligne.slice(2).trim())
    } else {
      listeCourante = null
      blocs.push({ type: 'paragraphe', texte: ligne })
    }
  }

  function formaterLigne(texteLigne, clePrefix) {
    return texteLigne
      .split(/(\*\*[^*]+\*\*)/g)
      .filter(Boolean)
      .map((segment, i) =>
        segment.startsWith('**') && segment.endsWith('**') ? (
          <strong key={`${clePrefix}-${i}`}>{segment.slice(2, -2)}</strong>
        ) : (
          <span key={`${clePrefix}-${i}`}>{segment}</span>
        ),
      )
  }

  return blocs.map((bloc, index) =>
    bloc.type === 'liste' ? (
      <ul key={index}>
        {bloc.items.map((item, i) => (
          <li key={i}>{formaterLigne(item, `${index}-${i}`)}</li>
        ))}
      </ul>
    ) : (
      <p key={index}>{formaterLigne(bloc.texte, `${index}`)}</p>
    ),
  )
}
