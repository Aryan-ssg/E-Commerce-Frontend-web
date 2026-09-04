import { getPasswordStrength } from '../utils/passwordStrength';

const SEGMENTS = 4;

export default function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const { score, label, checks } = getPasswordStrength(password);

  const labelColor =
    score === 0 ? 'text-text-muted' :
    score === 1 ? 'text-error' :
    score === 2 ? 'text-warning' :
    score === 3 ? 'text-brand' :
    'text-success';

  const barColor =
    score === 1 ? 'bg-error' :
    score === 2 ? 'bg-warning' :
    score === 3 ? 'bg-brand' :
    score === 4 ? 'bg-success' : 'bg-border';

  return (
    <div className="mt-2 space-y-2" aria-live="polite">
      {/* Segmented bar - 4 segments, grows with score */}
      <div className="flex gap-1.5">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < score ? barColor : 'bg-stone-200'}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${labelColor}`}>{label}</span>
        <span className="text-xs text-text-muted">{password.length} characters</span>
      </div>
      {score < 2 && (
        <p className="text-xs font-medium text-error">At least Fair required to register — add another character type.</p>
      )}

      {/* Checklist */}
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <Check ok={checks.length} label="At least 8 characters" />
        <Check ok={checks.lower} label="Lowercase letter" />
        <Check ok={checks.upper} label="Uppercase letter" />
        <Check ok={checks.digit} label="Number" />
        <Check ok={checks.special} label="Special character" />
        <Check ok={checks.longEnough} label="12+ for Strong" />
      </ul>
    </div>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 transition-colors ${ok ? 'text-success' : 'text-text-muted'}`}>
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] leading-none transition-colors ${ok ? 'border-success bg-success text-white' : 'border-border bg-white text-transparent'}`}
        aria-hidden
      >
        ✓
      </span>
      {label}
    </li>
  );
}