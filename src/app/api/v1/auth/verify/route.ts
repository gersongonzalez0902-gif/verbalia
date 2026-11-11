import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, parseBody, withRoute } from "@/server/http";
import { consumeToken } from "@/server/auth/tokens";
import { sendTemplate, templateWelcome } from "@/server/mailer";
import { normalizeEmail } from "@/server/auth/ids";

/**
 * POST /api/v1/auth/verify · #5 · RL 10/h
 *
 * Consume el token de un solo uso (EMAIL_VERIFY o EMAIL_CHANGE).
 * - EMAIL_VERIFY: marca emailVerifiedAt (+ correo de bienvenida la 1.ª vez).
 * - EMAIL_CHANGE: sustituye el email por el nuevo (payload) y re-verifica.
 * Token inválido/caducado/reusado ⇒ 400 genérico.
 */

const VerifySchema = z.object({
  token: z.string().min(10).max(200),
});

export const dynamic = "force-dynamic";

export const POST = withRoute({ route: "POST /api/v1/auth/verify" }, async (ctx) => {
  ctx.rl(10, 60 * 60 * 1000, "ip");

  const { token } = await parseBody(ctx, VerifySchema);
  const consumed = await consumeToken(token);
  if (!consumed) {
    throw new HttpError(400, "validation_error", "El enlace no es válido o ha caducado.");
  }

  const user = await prisma.user.findUnique({ where: { id: consumed.userId } });
  if (!user || user.status !== "ACTIVE") {
    throw new HttpError(400, "validation_error", "El enlace no es válido o ha caducado.");
  }

  if (consumed.type === "EMAIL_CHANGE") {
    const newEmail = normalizeEmail(consumed.payload);
    // Colisión tardía: alguien tomó ese correo mientras el enlace volaba.
    const taken = await prisma.user.findUnique({ where: { email: newEmail } });
    if (!newEmail || (taken && taken.id !== user.id)) {
      throw new HttpError(400, "validation_error", "El enlace no es válido o ha caducado.");
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail, emailVerifiedAt: new Date() },
    });
    return ctx.json({ ok: true, emailChanged: true });
  }

  // EMAIL_VERIFY (idempotente: re-verificar no rompe nada).
  const wasUnverified = user.emailVerifiedAt === null;
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
  });
  if (wasUnverified) {
    await sendTemplate(templateWelcome(user.displayName), user.email);
  }
  return ctx.json({ ok: true });
});
