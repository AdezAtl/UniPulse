import { c as createComponent } from './astro-component_CX9ahtru.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead, a2 as addAttribute } from './sequence_DCQR6rMJ.mjs';
import { r as renderComponent } from './entrypoint_D0IOJilK.mjs';
import { r as renderScript } from './script_DThEOJaB.mjs';
import { $ as $$AuthLayout } from './AuthLayout_CntZoztR.mjs';

const $$Signup = createComponent(async ($$result, $$props, $$slots) => {
  const DEPARTMENTS = ["Computer Science", "Engineering", "Medicine", "Law", "Business", "Arts & Humanities", "Natural Sciences", "Social Sciences", "Education", "Other"];
  const LEVELS = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "Postgraduate"];
  return renderTemplate`${renderComponent($$result, "AuthLayout", $$AuthLayout, { "title": "Create Account · UniPulse" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h2 style="font-size:1rem;font-weight:600;margin-bottom:.25rem">Create your account</h2> <p class="muted" style="margin-bottom:1.5rem">
A <strong>Pulse ID</strong> is auto-generated for you. Real name is optional.
</p> <form id="signup-form" style="display:flex;flex-direction:column;gap:1rem" novalidate> <div> <label class="label" for="username">Username <span style="color:var(--danger-text)">*</span></label> <input id="username" name="username" type="text" placeholder="e.g. john_doe" autocomplete="username" required minlength="3" maxlength="30" pattern="[a-zA-Z0-9_]+" class="input"> <p class="hint" style="margin-top:.25rem">Letters, numbers, underscores only.</p> </div> <div> <label class="label" for="full_name">Full Name <span class="hint">(optional)</span></label> <input id="full_name" name="full_name" type="text" placeholder="Your real name" autocomplete="name" maxlength="80" class="input"> </div> <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem"> <div> <label class="label" for="department">Department <span style="color:var(--danger-text)">*</span></label> <select id="department" name="department" required class="input"> <option value="" disabled selected>Select…</option> ${DEPARTMENTS.map((d) => renderTemplate`<option${addAttribute(d, "value")}>${d}</option>`)} </select> </div> <div> <label class="label" for="level">Level <span style="color:var(--danger-text)">*</span></label> <select id="level" name="level" required class="input"> <option value="" disabled selected>Select…</option> ${LEVELS.map((l) => renderTemplate`<option${addAttribute(l, "value")}>${l}</option>`)} </select> </div> </div> <div> <label class="label" for="email">Email <span style="color:var(--danger-text)">*</span></label> <input id="email" name="email" type="email" placeholder="you@university.edu" autocomplete="email" required class="input"> <p class="hint" style="margin-top:.25rem">Used only for password recovery.</p> </div> <div> <label class="label" for="password">Password <span style="color:var(--danger-text)">*</span></label> <input id="password" name="password" type="password" placeholder="Min. 8 characters" autocomplete="new-password" required minlength="8" class="input"> </div> <div id="signup-error" class="alert alert-danger" hidden></div> <button type="submit" id="signup-btn" class="btn btn-primary w-full" style="padding:.625rem;margin-top:.25rem">
Create account
</button> </form> <p class="hint text-center" style="margin-top:1.5rem">
Already have an account?
<a href="/login" style="color:var(--accent);text-decoration:none;font-weight:500">Sign in</a> </p> ` })} ${renderScript($$result, "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/signup.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/signup.astro", void 0);

const $$file = "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/signup.astro";
const $$url = "/signup";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Signup,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
