import { c as createComponent } from './astro-component_CX9ahtru.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead, a2 as addAttribute } from './sequence_DCQR6rMJ.mjs';
import { r as renderComponent } from './entrypoint_D0IOJilK.mjs';
import { r as renderScript } from './script_DThEOJaB.mjs';
import { $ as $$AppLayout } from './AppLayout_BFJUQSS3.mjs';
import { n as fetchResources } from './supabase_C86oT0sJ.mjs';
import { f as formatDate } from './utils_Bk6RVx7I.mjs';

const $$Resources = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Resources;
  const user = Astro2.locals.user;
  const { data: resources } = await fetchResources();
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "activeNav": "resources", "user": user, "title": "Resources · UniPulse", "data-astro-cid-gauq755v": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-header" data-astro-cid-gauq755v> <h1 class="page-title" data-astro-cid-gauq755v>Resources</h1> <button id="open-upload" class="btn btn-primary btn-sm" data-astro-cid-gauq755v>+ Upload</button> </div>  <div id="upload-modal" class="modal-overlay" hidden data-astro-cid-gauq755v> <div class="modal-box" data-astro-cid-gauq755v> <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem" data-astro-cid-gauq755v> <h3 style="font-size:.9375rem;font-weight:600" data-astro-cid-gauq755v>Upload Resource</h3> <button id="upload-close" class="btn btn-ghost btn-xs" data-astro-cid-gauq755v>✕</button> </div> <form id="upload-form" style="display:flex;flex-direction:column;gap:.875rem" data-astro-cid-gauq755v> <div data-astro-cid-gauq755v> <label class="label" for="res-title" data-astro-cid-gauq755v>Title *</label> <input id="res-title" name="title" type="text" required maxlength="120" class="input" placeholder="e.g. 2024 Thermodynamics Past Questions" data-astro-cid-gauq755v> </div> <div data-astro-cid-gauq755v> <label class="label" for="res-desc" data-astro-cid-gauq755v>Description</label> <textarea id="res-desc" name="description" rows="2" maxlength="300" class="input" style="resize:none" placeholder="Brief description…" data-astro-cid-gauq755v></textarea> </div> <div data-astro-cid-gauq755v> <label class="label" for="res-link" data-astro-cid-gauq755v>Link URL</label> <input id="res-link" name="link_url" type="url" class="input" placeholder="https://…" data-astro-cid-gauq755v> </div> <div id="upload-error" class="alert alert-danger" hidden data-astro-cid-gauq755v></div> <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:.25rem" data-astro-cid-gauq755v> <button type="button" id="upload-cancel" class="btn btn-secondary btn-sm" data-astro-cid-gauq755v>Cancel</button> <button type="submit" id="upload-btn" class="btn btn-primary  btn-sm" data-astro-cid-gauq755v>Upload</button> </div> </form> </div> </div> <div class="resources-list" data-astro-cid-gauq755v> ${!resources || resources.length === 0 ? renderTemplate`<div class="empty-state" data-astro-cid-gauq755v> <p class="empty-icon" data-astro-cid-gauq755v>◉</p> <p class="empty-title" data-astro-cid-gauq755v>No resources yet</p> <p class="empty-sub" data-astro-cid-gauq755v>Upload PDFs, links, or study materials.</p> </div>` : resources.map((r) => renderTemplate`<div class="resource-card card" data-astro-cid-gauq755v> <div class="resource-row" data-astro-cid-gauq755v> <span class="resource-type-icon" data-astro-cid-gauq755v>${r.file_url ? "📄" : "🔗"}</span> <div style="flex:1;min-width:0" data-astro-cid-gauq755v> <h3 class="resource-title" data-astro-cid-gauq755v>${r.title}</h3> ${r.description && renderTemplate`<p class="resource-desc muted" data-astro-cid-gauq755v>${r.description}</p>`} <div class="resource-meta" data-astro-cid-gauq755v> <span class="hint" data-astro-cid-gauq755v>@${r.uploader?.username ?? "unknown"}</span> <span class="hint" data-astro-cid-gauq755v>·</span> <span class="hint" data-astro-cid-gauq755v>${formatDate(r.created_at)}</span> ${r.link_url && renderTemplate`<a${addAttribute(r.link_url, "href")} target="_blank" rel="noopener noreferrer" class="resource-link" data-astro-cid-gauq755v>
Open link →
</a>`} ${r.file_url && renderTemplate`<a${addAttribute(r.file_url, "href")} target="_blank" rel="noopener noreferrer" class="resource-link" data-astro-cid-gauq755v>
Download →
</a>`} </div> </div> </div> </div>`)} </div> ` })} ${renderScript($$result, "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/resources.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/resources.astro", void 0);

const $$file = "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/resources.astro";
const $$url = "/resources";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Resources,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
