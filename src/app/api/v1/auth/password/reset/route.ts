import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, parseBody, withRoute } from "@/server/http";
import { checkPasswordPolicy, hashPassword, passwordPolicyMessage } from "@/server/auth/password";
import { consumeToken } from "@/server/auth/tokens";
import { createSession, revokeAllSessions } from "@/server/auth/session";

/**
 * POST /api/v1/auth/password/reset · #8 · RL 10/h
 * Token de 1 h, un solo uso. Invalida TODAS las sesiones y crea UNA nueva.
 */

const ResetSchema = z.object({
  token: z.string().min(10).max(200),
  password: z.string().min(1).max(200),
});

export const dynamic = "force-dynamic";

export const POST = withRoute({ route: "POST /api/v1/auth/password/reset" }, async (ctx) => {
  ctx.rl(10, 60 * 60 * 1000, "ip");

  const { token, password } = await parseBody(ctx, ResetSchema);

  const policy = checkPasswordPolicy(password);
  if (!policy.ok) {
    throw new HttpError(400, "validation_error", passwordPolicyMessage(policy.reason!));
  }

  const consumed = await consumeToken(token, "PASSWORD_RESET");
  if (!consumed) {
    throw new HttpError(400, "validation_error", "El enlace no es válido o ha caducado.");
  }

  const user = await prisma.user.findUnique({ where: { id: consumed.userId } });
  if (!user || user.status !== "ACTIVE") {
    throw new HttpError(400, "validation_error", "El enlace no es válido o ha caducado.");
  }

  const passwordHash = await hashPassword(password);

  // Reset ⇒ fuera de TODOS los dispositivos, y entra con una sesión nueva.
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);

  const { token: sessionToken } = await createSession(user.id, ctx.req);
  ctx.setSessionCookie(sessionToken);

  return ctx.json({ ok: true });
});
