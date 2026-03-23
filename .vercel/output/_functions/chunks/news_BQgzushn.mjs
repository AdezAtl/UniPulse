import { c as createComponent } from './astro-component_CX9ahtru.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead } from './sequence_DCQR6rMJ.mjs';
import { r as renderComponent } from './entrypoint_n2P0CDbj.mjs';
import { r as renderScript } from './script_DThEOJaB.mjs';
import { $ as $$AppLayout } from './AppLayout_CJ5ris7q.mjs';
import { k as createNews, l as fetchNews } from './supabase_C86oT0sJ.mjs';
import { f as formatDate } from './utils_Bk6RVx7I.mjs';

const $$News = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$News;
  const user = Astro2.locals.user;
  const isAdmin = Astro2.locals.isAdmin;
  if (Astro2.request.method === "POST" && isAdmin) {
    const form = await Astro2.request.formData();
    const title = form.get("title")?.trim();
    const content = form.get("content")?.trim();
    if (title && content) {
      await createNews(title, content, user.id);
      return Astro2.redirect("/news");
    }
  }
  const { data: newsItems } = await fetchNews();
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "activeNav": "news", "user": user, "title": "Campus News · UniPulse", "data-astro-cid-5kj6t6lp": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-header" data-astro-cid-5kj6t6lp> <h1 class="page-title" data-astro-cid-5kj6t6lp>Campus News</h1> ${isAdmin && renderTemplate`<button id="open-news" class="btn btn-primary btn-sm" data-astro-cid-5kj6t6lp>+ Post News</button>`} </div> ${isAdmin && renderTemplate`<div id="news-modal" class="modal-overlay" hidden data-astro-cid-5kj6t6lp> <div class="modal-box" data-astro-cid-5kj6t6lp> <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem" data-astro-cid-5kj6t6lp> <h3 style="font-size:.9375rem;font-weight:600" data-astro-cid-5kj6t6lp>Post Campus News</h3> <button id="news-close" class="btn btn-ghost btn-xs" data-astro-cid-5kj6t6lp>✕</button> </div> <form method="POST" style="display:flex;flex-direction:column;gap:.875rem" data-astro-cid-5kj6t6lp> <div data-astro-cid-5kj6t6lp> <label class="label" for="news-title" data-astro-cid-5kj6t6lp>Title *</label> <input id="news-title" name="title" type="text" required maxlength="140" class="input" placeholder="News headline…" data-astro-cid-5kj6t6lp> </div> <div data-astro-cid-5kj6t6lp> <label class="label" for="news-content" data-astro-cid-5kj6t6lp>Content *</label> <textarea id="news-content" name="content" required rows="5" maxlength="2000" class="input" style="resize:none" placeholder="Full announcement…" data-astro-cid-5kj6t6lp></textarea> </div> <div style="display:flex;justify-content:flex-end;gap:.5rem" data-astro-cid-5kj6t6lp> <button type="button" id="news-cancel" class="btn btn-secondary btn-sm" data-astro-cid-5kj6t6lp>Cancel</button> <button type="submit" class="btn btn-primary btn-sm" data-astro-cid-5kj6t6lp>Publish</button> </div> </form> </div> </div>`}<div class="news-list" data-astro-cid-5kj6t6lp> ${!newsItems || newsItems.length === 0 ? renderTemplate`<div class="empty-state" data-astro-cid-5kj6t6lp> <p class="empty-icon" data-astro-cid-5kj6t6lp>◫</p> <p class="empty-title" data-astro-cid-5kj6t6lp>No announcements yet</p> <p class="empty-sub" data-astro-cid-5kj6t6lp>Official campus news will appear here.</p> </div>` : newsItems.map((item) => renderTemplate`<article class="news-card card" data-astro-cid-5kj6t6lp> <div class="news-meta" data-astro-cid-5kj6t6lp> <span class="badge badge-warn" data-astro-cid-5kj6t6lp>Official</span> <span class="hint" data-astro-cid-5kj6t6lp>${formatDate(item.created_at)}</span> <span class="hint" data-astro-cid-5kj6t6lp>· @${item.author?.username ?? "admin"}</span> </div> <h2 class="news-title" data-astro-cid-5kj6t6lp>${item.title}</h2> <p class="news-body muted" data-astro-cid-5kj6t6lp>${item.content}</p> </article>`)} </div> ` })} ${renderScript($$result, "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/news.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/news.astro", void 0);

const $$file = "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/news.astro";
const $$url = "/news";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$News,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
