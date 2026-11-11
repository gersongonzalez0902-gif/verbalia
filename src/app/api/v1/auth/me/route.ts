import { publicUser, withRoute } from "@/server/http";

/**
 * GET /api/v1/auth/me · #4 · 🔓 pública
 * → { user } con sesión válida · { user: null } sin sesión (nunca 401).
 */

export const dynamic = "force-dynamic";

export const GET = withRoute({ route: "GET /api/v1/auth/me" }, async (ctx) => {
  const active = await ctx.tryAuth();
  return ctx.json({ user: active ? publicUser(active.user) : null });
});
