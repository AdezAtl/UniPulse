import { c as createComponent } from './astro-component_CdpYp1nz.mjs';
import 'piccolore';
import { L as renderTemplate, b7 as defineScriptVars, a2 as addAttribute, x as maybeRenderHead } from './sequence_B8w407xz.mjs';
import { r as renderComponent } from './entrypoint_B149CkqX.mjs';
import { D as DAILY_POST_LIMIT, f as fetchFeedPosts, a as fetchLikedPostIds, g as getTodayPostCount, b as getLastPostTime, c as getCooldownRemaining, $ as $$AppLayout } from './utils_CqccIin8.mjs';
import 'clsx';
import { $ as $$PostCard } from './PostCard_Bfe0SGsJ.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$PostComposer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$PostComposer;
  const { user, todayCount, cooldownSecs } = Astro2.props;
  const remaining = DAILY_POST_LIMIT - todayCount;
  const atLimit = remaining <= 0;
  const onCooldown = cooldownSecs > 0;
  return renderTemplate(_a || (_a = __template(["", '<div class="composer-wrap" data-astro-cid-hnyhqte5> <div class="composer-row" data-astro-cid-hnyhqte5> <div class="avatar avatar-lg shrink-0" data-astro-cid-hnyhqte5> ', ' </div> <div class="flex-1" data-astro-cid-hnyhqte5> ', " </div> </div> </div> <script>(function(){", "\n  if (!atLimit) {\n    const textarea = document.getElementById('post-content');\n    const charEl   = document.getElementById('char-counter');\n    const submitBtn= document.getElementById('submit-btn');\n    const errorEl  = document.getElementById('post-error');\n    textarea?.addEventListener('input', () => {\n      const len = textarea.value.length;\n      charEl.textContent = `${len}/280`;\n      charEl.style.color = len >= 280 ? 'var(--red)' : len >= 250 ? 'var(--amber)' : '';\n    });\n    let remaining = cooldownSecs;\n    function fmt(s) { return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }\n    if (remaining > 0) {\n      const timerEl = document.getElementById('cooldown-timer');\n      timerEl.textContent = fmt(remaining);\n      const tick = setInterval(() => { remaining--; if (remaining<=0) { clearInterval(tick); location.reload(); } else timerEl.textContent=fmt(remaining); }, 1000);\n    }\n    document.getElementById('post-form')?.addEventListener('submit', async e => {\n      e.preventDefault();\n      const content = textarea.value.trim();\n      if (!content) return;\n      submitBtn.disabled = true; submitBtn.textContent='...'; errorEl.style.display='none';\n      const res = await fetch('/api/posts', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({content}) });\n      if (res.ok) { location.reload(); }\n      else { const {error} = await res.json().catch(()=>({error:'Something went wrong.'})); errorEl.textContent=error; errorEl.style.display='block'; submitBtn.disabled=false; submitBtn.textContent='Pulse'; }\n    });\n  }\n})();<\/script>"], ["", '<div class="composer-wrap" data-astro-cid-hnyhqte5> <div class="composer-row" data-astro-cid-hnyhqte5> <div class="avatar avatar-lg shrink-0" data-astro-cid-hnyhqte5> ', ' </div> <div class="flex-1" data-astro-cid-hnyhqte5> ', " </div> </div> </div> <script>(function(){", "\n  if (!atLimit) {\n    const textarea = document.getElementById('post-content');\n    const charEl   = document.getElementById('char-counter');\n    const submitBtn= document.getElementById('submit-btn');\n    const errorEl  = document.getElementById('post-error');\n    textarea?.addEventListener('input', () => {\n      const len = textarea.value.length;\n      charEl.textContent = \\`\\${len}/280\\`;\n      charEl.style.color = len >= 280 ? 'var(--red)' : len >= 250 ? 'var(--amber)' : '';\n    });\n    let remaining = cooldownSecs;\n    function fmt(s) { return \\`\\${String(Math.floor(s/60)).padStart(2,'0')}:\\${String(s%60).padStart(2,'0')}\\`; }\n    if (remaining > 0) {\n      const timerEl = document.getElementById('cooldown-timer');\n      timerEl.textContent = fmt(remaining);\n      const tick = setInterval(() => { remaining--; if (remaining<=0) { clearInterval(tick); location.reload(); } else timerEl.textContent=fmt(remaining); }, 1000);\n    }\n    document.getElementById('post-form')?.addEventListener('submit', async e => {\n      e.preventDefault();\n      const content = textarea.value.trim();\n      if (!content) return;\n      submitBtn.disabled = true; submitBtn.textContent='...'; errorEl.style.display='none';\n      const res = await fetch('/api/posts', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({content}) });\n      if (res.ok) { location.reload(); }\n      else { const {error} = await res.json().catch(()=>({error:'Something went wrong.'})); errorEl.textContent=error; errorEl.style.display='block'; submitBtn.disabled=false; submitBtn.textContent='Pulse'; }\n    });\n  }\n})();<\/script>"])), maybeRenderHead(), user.avatar_url ? renderTemplate`<img${addAttribute(user.avatar_url, "src")} alt="" data-astro-cid-hnyhqte5>` : user.username.charAt(0).toUpperCase(), atLimit ? renderTemplate`<div class="limit-msg" data-astro-cid-hnyhqte5> <span class="limit-icon" data-astro-cid-hnyhqte5>⏳</span> <div data-astro-cid-hnyhqte5> <p style="font-size:0.875rem;font-weight:500;color:var(--text-1);margin-bottom:2px" data-astro-cid-hnyhqte5>Daily limit reached</p> <p class="muted" data-astro-cid-hnyhqte5>You've reached your daily post limit. Come back tomorrow!</p> </div> </div>` : renderTemplate`<form id="post-form" class="composer-form" data-astro-cid-hnyhqte5> <textarea id="post-content" name="content" maxlength="280" rows="3"${addAttribute(onCooldown ? "Cooldown active…" : "What's happening on campus?", "placeholder")}${addAttribute(onCooldown, "disabled")} class="composer-textarea" aria-label="Post content" data-astro-cid-hnyhqte5></textarea> <div class="composer-footer" data-astro-cid-hnyhqte5> <div data-astro-cid-hnyhqte5> ${onCooldown ? renderTemplate`<span class="cooldown-badge" data-astro-cid-hnyhqte5>⏱ <span id="cooldown-timer" data-astro-cid-hnyhqte5></span></span>` : renderTemplate`<span class="muted" style="font-size:0.8125rem" data-astro-cid-hnyhqte5>Posts today: <strong style="color:var(--text-1)" data-astro-cid-hnyhqte5>${todayCount}/${DAILY_POST_LIMIT}</strong></span>`} </div> <div class="flex items-center gap-3" data-astro-cid-hnyhqte5> <span id="char-counter" class="char-counter" data-astro-cid-hnyhqte5>0/280</span> <button type="submit" id="submit-btn" class="btn btn-primary btn-sm"${addAttribute(onCooldown, "disabled")} data-astro-cid-hnyhqte5>Pulse</button> </div> </div> <div id="post-error" class="alert alert-danger" style="margin-top:0.5rem;display:none" data-astro-cid-hnyhqte5></div> </form>`, defineScriptVars({ cooldownSecs, atLimit }));
}, "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/components/feed/PostComposer.astro", void 0);

const $$Feed = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Feed;
  const user = Astro2.locals.user;
  const [{ data: posts }, likedIds, todayCount, lastPost] = await Promise.all([
    fetchFeedPosts(),
    fetchLikedPostIds(user.id),
    getTodayPostCount(user.id),
    getLastPostTime(user.id)
  ]);
  const cooldownSecs = getCooldownRemaining(lastPost);
  const likedSet = new Set(likedIds);
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "activeNav": "feed", "user": user, "title": "Feed · UniPulse" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="feed-header page-header"> <h1 class="page-title">The Common Room</h1> </div> ${renderComponent($$result2, "PostComposer", $$PostComposer, { "user": user, "todayCount": todayCount, "cooldownSecs": cooldownSecs })} <div class="posts-list"> ${!posts || posts.length === 0 ? renderTemplate`<div class="empty-state"> <p class="empty-icon">▦</p> <p class="empty-title">Nothing here yet</p> <p class="empty-sub">Be the first to post something!</p> </div>` : posts.map((post) => renderTemplate`${renderComponent($$result2, "PostCard", $$PostCard, { "post": post, "isLiked": likedSet.has(post.id), "isAdmin": Astro2.locals.isAdmin, "currentUserId": user.id })}`)} </div> ` })}`;
}, "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/feed.astro", void 0);

const $$file = "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/feed.astro";
const $$url = "/feed";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Feed,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
