// Security utilities — no plaintext passwords, brute-force protection

const CREDS_KEY = 'broki_admin_creds';
const ATTEMPTS_KEY = 'broki_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

export type AdminCreds = {
  username: string;
  passwordHash: string;
  lastChanged: string;
};

export type LoginAttempts = {
  count: number;
  lastAttempt: number;
  lockedUntil: number;
};

// SHA-256 via Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const buf = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function initAdminCreds(): Promise<void> {
  if (localStorage.getItem(CREDS_KEY)) return;
  const passwordHash = await hashPassword('1111');
  const creds: AdminCreds = {
    username: 'broki',
    passwordHash,
    lastChanged: new Date().toISOString(),
  };
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
}

export function getAdminCreds(): AdminCreds | null {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveAdminCreds(creds: AdminCreds): void {
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
}

// Brute-force protection
export function getLoginAttempts(): LoginAttempts {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : { count: 0, lastAttempt: 0, lockedUntil: 0 };
  } catch { return { count: 0, lastAttempt: 0, lockedUntil: 0 }; }
}

export function isLockedOut(): { locked: boolean; remainingMs: number } {
  const attempts = getLoginAttempts();
  const now = Date.now();
  if (attempts.lockedUntil > now) {
    return { locked: true, remainingMs: attempts.lockedUntil - now };
  }
  return { locked: false, remainingMs: 0 };
}

export function recordFailedAttempt(): LoginAttempts {
  const attempts = getLoginAttempts();
  const now = Date.now();
  const newCount = attempts.count + 1;
  const updated: LoginAttempts = {
    count: newCount,
    lastAttempt: now,
    lockedUntil: newCount >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0,
  };
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(updated));
  return updated;
}

export function clearLoginAttempts(): void {
  localStorage.removeItem(ATTEMPTS_KEY);
}

export function remainingAttempts(): number {
  const { count } = getLoginAttempts();
  return Math.max(0, MAX_ATTEMPTS - count);
}

// Password strength scorer (0-4)
export function passwordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: 'Muy débil', color: 'bg-red-500' };
  if (score === 2) return { score, label: 'Débil', color: 'bg-orange-500' };
  if (score === 3) return { score, label: 'Media', color: 'bg-yellow-500' };
  if (score === 4) return { score, label: 'Fuerte', color: 'bg-lime-500' };
  return { score, label: 'Muy fuerte', color: 'bg-green-600' };
}

// Input sanitization — strips HTML tags
export function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}
