import { HttpError, withRoute } from "@/server/http";
import { revokeSession } from "@/server/auth/session";

/**
 * DELETE /api/v1/auth/sessions/:id · #12 · RL 10/h (usuario autenticado)
 * "Cerrar sesión en otros dispositivos": borra la sesión propia indicada.
 * 404 si no existe o no es tuya.
 */

export const dynamic = "force-dynamic";

export const DELETE = withRoute({ route: "DELETE /api/v1/auth/sessions/:id" }, async (ctx) => {
  const { user, session } = await ctx.auth();
  ctx.rl(10, 60 * 60 * 1000, "user");

  const id = ctx.params.id;
  if (!id) throw new HttpError(404, "not_found", "Esa sesión no existe.");

  if (id === session.id) {
    // Cerrar la actual = logout (también limpia la cookie).
    await revokeSession(id, user.id);
    ctx.clearSessionCookie();
    return ctx.json({ ok: true });
  }

  const ok = await revokeSession(id, user.id);
  if (!ok) throw new HttpError(404, "not_found", "Esa sesión no existe.");
  return ctx.json({ ok: true });
});
