import { c as createComponent } from './astro-component_CX9ahtru.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead } from './sequence_DCQR6rMJ.mjs';
import { r as renderComponent } from './entrypoint_n2P0CDbj.mjs';
import { $ as $$BaseLayout } from './BaseLayout_KL2kuLI4.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "404 · UniPulse", "data-astro-cid-zetdm5md": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="not-found" data-astro-cid-zetdm5md> <p class="code" data-astro-cid-zetdm5md>404</p> <h1 class="title" data-astro-cid-zetdm5md>Page not found</h1> <p class="sub" data-astro-cid-zetdm5md>This page doesn't exist or you don't have access to it.</p> <a href="/feed" class="btn btn-primary" style="padding:.625rem 1.5rem;border-radius:var(--radius-lg)" data-astro-cid-zetdm5md>Back to Feed</a> </div> ` })}`;
}, "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/404.astro", void 0);

const $$file = "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
