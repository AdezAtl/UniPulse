import { c as createComponent } from './astro-component_CX9ahtru.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead } from './sequence_DCQR6rMJ.mjs';
import { r as renderComponent } from './entrypoint_n2P0CDbj.mjs';
import { r as renderScript } from './script_DThEOJaB.mjs';
import { $ as $$AuthLayout } from './AuthLayout_Q3AVPMh3.mjs';

const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Login;
  const error = Astro2.url.searchParams.get("error");
  Astro2.url.searchParams.get("redirect") ?? "/feed";
  return renderTemplate`${renderComponent($$result, "AuthLayout", $$AuthLayout, { "title": "Sign In · UniPulse" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h2 style="font-size:1rem;font-weight:600;margin-bottom:.25rem">Welcome back</h2> <p class="muted" style="margin-bottom:1.5rem">Sign in with your username, email, or Pulse ID.</p> ${error === "banned" && renderTemplate`<div class="alert alert-danger" style="margin-bottom:1rem">
Your account has been suspended. Contact your campus admin.
</div>`}${error === "unauthorized" && renderTemplate`<div class="alert alert-danger" style="margin-bottom:1rem">
You don't have permission to access that page.
</div>`}<form id="login-form" style="display:flex;flex-direction:column;gap:1rem"> <div> <label class="label" for="identifier">Username / Email / Pulse ID</label> <input id="identifier" name="identifier" type="text" placeholder="e.g. john_doe, UP-ABC123, or email@uni.edu" autocomplete="username" required class="input"> <p id="id-hint" class="hint" style="margin-top:.375rem;min-height:1rem"></p> </div> <div> <label class="label" for="password">Password</label> <input id="password" name="password" type="password" placeholder="••••••••" autocomplete="current-password" required class="input"> </div> <div id="login-error" class="alert alert-danger" hidden></div> <button type="submit" id="login-btn" class="btn btn-primary w-full" style="padding:.625rem;margin-top:.25rem">
Sign in
</button> </form> <p class="hint text-center" style="margin-top:1.5rem">
New to UniPulse?
<a href="/signup" style="color:var(--accent);text-decoration:none;font-weight:500">Create an account</a> </p> ` })} ${renderScript($$result, "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/login.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/login.astro", void 0);

const $$file = "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
