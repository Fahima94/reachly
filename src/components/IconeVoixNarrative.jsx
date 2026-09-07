export default function IconeVoixNarrative({ valeur }) {
  if (valeur === 'je_masculin') {
    return (
      <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
        <circle cx="12" cy="5" r="3" fill="currentColor" />
        <path
          d="M8 21v-6.5C8 12 9.8 10 12 10s4 2 4 4.5V21h-2.5v-5.5h-1V21h-1v-5.5h-1V21H8z"
          fill="currentColor"
        />
      </svg>
    )
  }

  if (valeur === 'je_feminin') {
    return (
      <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
        <circle cx="12" cy="5" r="3" fill="currentColor" />
        <path d="M9.3 10h5.4l2.3 8h-3l.4 3h-4.8l.4-3h-3z" fill="currentColor" />
      </svg>
    )
  }

  // nous : deux silhouettes superposées
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
      <circle cx="8" cy="6" r="2.6" fill="currentColor" />
      <path
        d="M8 10c-2.5 0-4.5 1.8-4.5 4.5V17h9v-2.5C12.5 11.8 10.5 10 8 10z"
        fill="currentColor"
      />
      <circle cx="16" cy="6" r="2.6" fill="currentColor" opacity="0.65" />
      <path
        d="M16 10c-2.5 0-4.5 1.8-4.5 4.5V17h9v-2.5c0-2.7-2-4.5-4.5-4.5z"
        fill="currentColor"
        opacity="0.65"
      />
    </svg>
  )
}
