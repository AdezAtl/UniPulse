const DAILY_POST_LIMIT = 5;
const COOLDOWN_MINUTES = 15;
function formatRelativeTime(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1e3);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
function formatFullDate(ts) {
  return new Date(ts).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function formatDate(ts) {
  return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function getCooldownRemaining(lastPostTime) {
  if (!lastPostTime) return 0;
  const elapsed = (Date.now() - lastPostTime.getTime()) / 1e3;
  return Math.max(0, Math.ceil(COOLDOWN_MINUTES * 60 - elapsed));
}
function truncate(str, n) {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

export { DAILY_POST_LIMIT as D, formatFullDate as a, formatRelativeTime as b, formatDate as f, getCooldownRemaining as g, truncate as t };
