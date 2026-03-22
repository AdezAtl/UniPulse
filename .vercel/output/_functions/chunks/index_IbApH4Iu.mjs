import { c as createComponent } from './astro-component_CdpYp1nz.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead } from './sequence_B8w407xz.mjs';
import { r as renderComponent } from './entrypoint_B149CkqX.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BdC68jWf.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "UniPulse — The Campus Common Room", "data-astro-cid-j7pv25f6": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="landing" data-astro-cid-j7pv25f6> <div class="hero" data-astro-cid-j7pv25f6> <div class="hero-logo" data-astro-cid-j7pv25f6> <span class="logo-mark" data-astro-cid-j7pv25f6>UP</span> <span class="hero-name" data-astro-cid-j7pv25f6>UniPulse</span> </div> <h1 class="hero-title" data-astro-cid-j7pv25f6>The campus common room.</h1> <p class="hero-sub" data-astro-cid-j7pv25f6>
A high-signal social space built for students.<br data-astro-cid-j7pv25f6>
No noise. No real names required.
</p> <div class="hero-actions" data-astro-cid-j7pv25f6> <a href="/signup" class="btn btn-primary" style="padding:.75rem 2rem;font-size:1rem;border-radius:var(--radius-lg)" data-astro-cid-j7pv25f6>Get started</a> <a href="/login" class="btn btn-secondary" style="padding:.75rem 2rem;font-size:1rem;border-radius:var(--radius-lg)" data-astro-cid-j7pv25f6>Sign in</a> </div> </div> <div class="features" data-astro-cid-j7pv25f6> ${[
    { icon: "▦", title: "The Common Room", desc: "Share what's happening. Max 5 posts a day keeps the feed intentional." },
    { icon: "◎", title: "Pseudonymous Identity", desc: "Your Pulse ID is permanent. Your name is optional. You control your identity." },
    { icon: "◉", title: "Campus Resources", desc: "Upload PDFs, share links. Everything your cohort needs in one place." },
    { icon: "◫", title: "Official News", desc: "Admin-verified campus announcements. No misinformation." }
  ].map((f) => renderTemplate`<div class="feature-card card" data-astro-cid-j7pv25f6> <span class="feature-icon" data-astro-cid-j7pv25f6>${f.icon}</span> <h3 class="feature-title" data-astro-cid-j7pv25f6>${f.title}</h3> <p class="feature-desc" data-astro-cid-j7pv25f6>${f.desc}</p> </div>`)} </div> </div> ` })}`;
}, "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/index.astro", void 0);

const $$file = "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
