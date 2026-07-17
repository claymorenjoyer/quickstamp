const attempts = new Map<string, { count: number; firstAttempt: number; blockedUntil: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_MS = 15 * 60 * 1000; // 15 minutes

// Clean up stale entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of attempts) {
    if (now > entry.blockedUntil && now - entry.firstAttempt > WINDOW_MS) {
      attempts.delete(key);
    }
  }
}, 30 * 60 * 1000);

export function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (entry) {
    if (now < entry.blockedUntil) {
      const minutesLeft = Math.ceil((entry.blockedUntil - now) / 60000);
      return {
        allowed: false,
        message: `Too many attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`,
      };
    }
    if (now - entry.firstAttempt > WINDOW_MS) {
      attempts.set(ip, { count: 1, firstAttempt: now, blockedUntil: 0 });
      return { allowed: true };
    }
    if (entry.count >= MAX_ATTEMPTS) {
      const blockedUntil = now + BLOCK_MS;
      attempts.set(ip, { ...entry, blockedUntil });
      const minutesLeft = Math.ceil(BLOCK_MS / 60000);
      return {
        allowed: false,
        message: `Too many attempts. Try again in ${minutesLeft} minutes.`,
      };
    }
  }

  return { allowed: true };
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry) {
    entry.count++;
  } else {
    attempts.set(ip, { count: 1, firstAttempt: now, blockedUntil: 0 });
  }
}

export function resetAttempts(ip: string): void {
  attempts.delete(ip);
}
