import { c as createComponent } from './astro-component_CX9ahtru.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead, b7 as renderSlot } from './sequence_DCQR6rMJ.mjs';
import { r as renderComponent } from './entrypoint_n2P0CDbj.mjs';
import { $ as $$BaseLayout } from './BaseLayout_KL2kuLI4.mjs';

const $$AuthLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$AuthLayout;
  const { title } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "data-astro-cid-3qlrnpww": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="auth-shell" data-astro-cid-3qlrnpww> <div class="auth-brand" data-astro-cid-3qlrnpww> <a href="/" class="logo-wrap" data-astro-cid-3qlrnpww> <span class="logo-mark" data-astro-cid-3qlrnpww>UP</span> <span class="logo-text" data-astro-cid-3qlrnpww>UniPulse</span> </a> <p class="muted" style="margin-top:0.25rem" data-astro-cid-3qlrnpww>The campus common room.</p> </div> <div class="auth-card card p-6 slide-up" data-astro-cid-3qlrnpww> ${renderSlot($$result2, $$slots["default"])} </div> <p class="hint center" style="max-width:260px" data-astro-cid-3qlrnpww>Your identity stays yours. No real names required.</p> </div> ` })}`;
}, "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/layouts/AuthLayout.astro", void 0);

export { $$AuthLayout as $ };
