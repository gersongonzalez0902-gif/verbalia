import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, parseBody, withRoute } from "@/server/http";
import { checkPasswordPolicy, hashPassword, passwordPolicyMessage, verifyPassword } from "@/server/auth/password";

/**
 * POST /api/v1/auth/password/change · #9 · RL 5/h (usuario autenticado)
 * {current, next} → {ok}. La sesión actual se conserva (solo el reset
 * invalida sesiones).
 */

const ChangeSchema = z.object({
  current: z.string().min(1).max(200),
  next: z.string().min(1).max(200),
});

export const dynamic = "force-dynamic";

export const POST = withRoute({ route: "POST /api/v1/auth/password/change" }, async (ctx) => {
  const { user } = await ctx.auth();
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

  return ctx.json({ ok: true });
});
