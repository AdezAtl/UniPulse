import { c as createComponent } from './astro-component_CX9ahtru.mjs';
import 'piccolore';
import { a2 as addAttribute, b9 as renderHead, b7 as renderSlot, L as renderTemplate } from './sequence_DCQR6rMJ.mjs';
import 'clsx';

const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title = "UniPulse — The Campus Common Room",
    description = "A privacy-focused social platform for university students."
  } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description"${addAttribute(description, "content")}><meta name="robots" content="noindex, nofollow"><title>${title}</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap">${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
