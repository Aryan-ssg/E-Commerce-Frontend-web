export type StrengthLabel = 'Too weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';

export interface PasswordChecks {
  length: boolean;      // >= 8
  lower: boolean;
  upper: boolean;
  digit: boolean;
  special: boolean;
  longEnough: boolean;  // >= 12 for Strong
}

export interface PasswordStrength {
  score: number; // 0-4
  label: StrengthLabel;
  percent: number; // 0-100
  checks: PasswordChecks;
  color: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  const checks: PasswordChecks = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digit: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    longEnough: password.length >= 12,
  };

  if (!password) {
    return { score: 0, label: 'Too weak', percent: 0, checks, color: 'var(--color-border)' };
  }

  // Types satisfied
  const typeCount = [checks.lower, checks.upper, checks.digit, checks.special].filter(Boolean).length;

  let score = 0;
  let label: StrengthLabel = 'Too weak';

  if (password.length < 4) {
    score = 0;
    label = 'Too weak';
  } else if (!checks.length) {
    // Short but has some complexity — cap at Weak
    score = 1;
    label = 'Weak';
  } else if (checks.length && typeCount <= 1) {
    score = 1;
    label = 'Weak';
  } else if (checks.length && typeCount === 2) {
    score = 2;
    label = 'Fair';
  } else if (checks.length && typeCount === 3) {
    score = 3;
    label = 'Good';
  } else if (checks.length && typeCount >= 4) {
    // All 4 types -> Good, Strong only if also longEnough
    score = checks.longEnough ? 4 : 3;
    label = checks.longEnough ? 'Strong' : 'Good';
  }

  // Bonus: length >= 12 bumps Fair->Good, Good stays Good, Strong already capped
  if (checks.longEnough && score === 2) {
    score = 3;
    label = 'Good';
  }

  const percent = (score / 4) * 100;

  const color =
    score === 0
      ? 'var(--color-border)'
      : score === 1
        ? 'var(--color-error)'          // red
        : score === 2
          ? 'var(--color-warning)'      // amber
          : score === 3
            ? 'var(--color-brand)'       // teal — Good
            : 'var(--color-success)';   // green — Strong

  return { score, label, percent, checks, color };
}