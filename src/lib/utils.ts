export const DAILY_POST_LIMIT = 5;
export const COOLDOWN_MINUTES = 15;

export function formatRelativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)  return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `${d}d`;
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function formatFullDate(ts: string): string {
  return new Date(ts).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getCooldownRemaining(lastPostTime: Date | null): number {
  if (!lastPostTime) return 0;
  const elapsed = (Date.now() - lastPostTime.getTime()) / 1000;
  return Math.max(0, Math.ceil(COOLDOWN_MINUTES * 60 - elapsed));
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '…' : str;
}
