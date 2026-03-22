import { c as createComponent } from './astro-component_CdpYp1nz.mjs';
import 'piccolore';
import { L as renderTemplate, x as maybeRenderHead, a2 as addAttribute } from './sequence_B8w407xz.mjs';
import { r as renderComponent } from './entrypoint_B149CkqX.mjs';
import { s as supabase, i as fetchUserPosts, a as fetchLikedPostIds, $ as $$AppLayout, h as formatDate } from './utils_CqccIin8.mjs';
import { $ as $$PostCard } from './PostCard_Bfe0SGsJ.mjs';

const $$username = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$username;
  const { username } = Astro2.params;
  const viewer = Astro2.locals.user;
  const isAdmin = Astro2.locals.isAdmin;
  const { data: profileUser } = await supabase.from("users").select("id,username,pulse_id,full_name,department,level,avatar_url,role,created_at").eq("username", username).single();
  if (!profileUser) return Astro2.redirect("/feed");
  const [{ data: posts }, likedIds] = await Promise.all([
    fetchUserPosts(profileUser.id),
    fetchLikedPostIds(viewer.id)
  ]);
  const likedSet = new Set(likedIds);
  const isOwnPage = viewer.id === profileUser.id;
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "activeNav": "profile", "user": viewer, "title": `@${profileUser.username} · UniPulse`, "data-astro-cid-ozbzfvtj": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="profile-header" data-astro-cid-ozbzfvtj> <div class="profile-avatar-wrap" data-astro-cid-ozbzfvtj> <div class="avatar avatar-xl" data-astro-cid-ozbzfvtj> ${profileUser.avatar_url ? renderTemplate`<img${addAttribute(profileUser.avatar_url, "src")} alt="" data-astro-cid-ozbzfvtj>` : profileUser.username.charAt(0).toUpperCase()} </div> ${profileUser.role === "admin" && renderTemplate`<span class="badge badge-warn profile-role-badge" data-astro-cid-ozbzfvtj>Admin</span>`} </div> <div style="flex:1;min-width:0" data-astro-cid-ozbzfvtj> <div class="profile-name-row" data-astro-cid-ozbzfvtj> <h1 class="profile-username" data-astro-cid-ozbzfvtj>@${profileUser.username}</h1> ${profileUser.full_name && renderTemplate`<span class="muted" data-astro-cid-ozbzfvtj>${profileUser.full_name}</span>`} </div> <div class="profile-meta" data-astro-cid-ozbzfvtj> <span class="pulse-id" data-astro-cid-ozbzfvtj>${profileUser.pulse_id}</span> <span class="hint" data-astro-cid-ozbzfvtj>·</span> <span class="hint" data-astro-cid-ozbzfvtj>${profileUser.department}</span> <span class="hint" data-astro-cid-ozbzfvtj>·</span> <span class="hint" data-astro-cid-ozbzfvtj>${profileUser.level}</span> </div> <p class="hint" style="margin-top:.25rem" data-astro-cid-ozbzfvtj>Joined ${formatDate(profileUser.created_at)}</p> </div> ${isOwnPage && renderTemplate`<a href="/settings" class="btn btn-secondary btn-sm" style="align-self:flex-start" data-astro-cid-ozbzfvtj>
Edit profile
</a>`} </div> <div class="posts-divider" data-astro-cid-ozbzfvtj> <span class="hint" data-astro-cid-ozbzfvtj>${posts?.length ?? 0} posts</span> </div> <div data-astro-cid-ozbzfvtj> ${!posts || posts.length === 0 ? renderTemplate`<div class="empty-state" data-astro-cid-ozbzfvtj> <p class="empty-icon" data-astro-cid-ozbzfvtj>▦</p> <p class="empty-title" data-astro-cid-ozbzfvtj>No posts yet</p> ${isOwnPage && renderTemplate`<p class="empty-sub" data-astro-cid-ozbzfvtj>Go share something on the feed!</p>`} </div>` : posts.map((post) => renderTemplate`${renderComponent($$result2, "PostCard", $$PostCard, { "post": post, "isLiked": likedSet.has(post.id), "isAdmin": isAdmin, "currentUserId": viewer.id, "data-astro-cid-ozbzfvtj": true })}`)} </div> ` })}`;
}, "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/profile/[username].astro", void 0);

const $$file = "C:/Users/DELL/Documents/WORK/coding/coding/UniPulse/src/pages/profile/[username].astro";
const $$url = "/profile/[username]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$username,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
