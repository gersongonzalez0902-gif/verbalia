import { withRoute } from "@/server/http";
import { revokeSession } from "@/server/auth/session";

/**
 * POST /api/v1/auth/logout · #3
 * Borra la sesión actual (si la hay) y limpia la cookie. Siempre {ok}.
 */

export const dynamic = "force-dynamic";

export const POST = withRoute({ route: "POST /api/v1/auth/logout" }, async (ctx) => {
  const active = await ctx.tryAuth();
  if (active) {
    await revokeSession(active.session.id, active.user.id);
  }
  ctx.clearSessionCookie();
  return ctx.json({ ok: true });
});
