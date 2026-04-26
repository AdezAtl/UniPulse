// src/lib/utils.ts

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function generatePulseId() {
  return `UP-${Math.floor(100000 + Math.random() * 900000)}`;
}

export const DAILY_POST_LIMIT = 5;
export const COOLDOWN_MINUTES = 1;

export function formatRelativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function formatFullDate(ts: string): string {
  return new Date(ts).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function getCooldownRemaining(lastPostTime: Date | null): number {
  if (!lastPostTime) return 0;
  const elapsed = (Date.now() - lastPostTime.getTime()) / 1000;
  return Math.max(0, Math.ceil(COOLDOWN_MINUTES * 60 - elapsed));
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export function parseMarkdown(text: string | null): string {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  // bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: underline;">$1</a>');
  // code
  html = html.replace(/`([^`]+)`/g, '<code style="background: var(--bg-2); padding: .125rem .25rem; border-radius: 4px; font-family: monospace;">$1</code>');
  // newlines
  html = html.replace(/\n/g, '<br/>');

  return html;
}