export default function ProgressionOnboarding({ etape, total }) {
  const pourcentage = Math.round((etape / total) * 100)

  return (
    <div className="progression-onboarding">
      <p>
        Étape {etape} sur {total}
      </p>
      <div
        role="progressbar"
        aria-valuenow={etape}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Étape ${etape} sur ${total}`}
      >
        <div style={{ width: `${pourcentage}%` }} />
      </div>
    </div>
  )
}
