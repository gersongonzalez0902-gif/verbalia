import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, parseBody, withRoute } from "@/server/http";
import { checkPasswordPolicy, hashPassword, passwordPolicyMessage, verifyPassword } from "@/server/auth/password";
import { revokeAllSessions } from "@/server/auth/session";

/**
 * POST /api/v1/auth/password/change · #9 · RL 5/h (usuario autenticado)
 * {current, next} → {ok}. Ola D · Área 2.4: al cambiar la contraseña se
 * cierran TODAS las demás sesiones (la actual sigue viva); los demás
 * dispositivos tendrán que volver a entrar con la contraseña nueva.
 */

const ChangeSchema = z.object({
  current: z.string().min(1).max(200),
  next: z.string().min(1).max(200),
});

export const dynamic = "force-dynamic";

export const POST = withRoute({ route: "POST /api/v1/auth/password/change" }, async (ctx) => {
  const active = await ctx.auth();
  const user = active.user;
  ctx.rl(5, 60 * 60 * 1000, "user");

  const { current, next } = await parseBody(ctx, ChangeSchema);

  if (!user.passwordHash) {
    throw new HttpError(400, "validation_error", "Esta cuenta no tiene contraseña.");
  }
  const currentOk = await verifyPassword(current, user.passwordHash);
  if (!currentOk) {
    throw new HttpError(400, "validation_error", "La contraseña actual no es correcta.");
  }
  if (current === next) {
    throw new HttpError(400, "validation_error", "Elige una contraseña distinta de la actual.");
  }
  const policy = checkPasswordPolicy(next);
  if (!policy.ok) {
    throw new HttpError(400, "validation_error", passwordPolicyMessage(policy.reason!));
  }

  const passwordHash = await hashPassword(next);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  // Ola D · Área 2.4: la contraseña nueva cierra las demás sesiones
  // (esta se conserva para no cerrarle la sesión al que la cambia).
  const cerradas = await revokeAllSessions(user.id, active.session.id);

  return ctx.json({ ok: true, ...(cerradas > 0 ? { sesionesCerradas: cerradas } : {}) });
});
