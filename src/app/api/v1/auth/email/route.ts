import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, parseBody, withRoute } from "@/server/http";
import { verifyPassword } from "@/server/auth/password";
import { normalizeEmail } from "@/server/auth/ids";
import { issueToken } from "@/server/auth/tokens";
import { sendTemplate, templateEmailChange, templateRegistrationAttempt } from "@/server/mailer";

/**
 * POST /api/v1/auth/email · #10 · RL 3/h (usuario autenticado)
 * {newEmail, password} → {ok} SIEMPRE (anti-enumeración).
 * - Correo ocupado: {ok} genérico + aviso al dueño; no se emite token.
 * - Libre: token EMAIL_CHANGE (48 h) al NUEVO correo; al confirmar se
 *   sustituye y se re-verifica.
 */

const EmailChangeSchema = z.object({
  newEmail: z.email().max(254).transform(normalizeEmail),
  password: z.string().min(1).max(200),
});

export const dynamic = "force-dynamic";

export const POST = withRoute({ route: "POST /api/v1/auth/email" }, async (ctx) => {
  const { user } = await ctx.auth();
  ctx.rl(3, 60 * 60 * 1000, "user");

  const { newEmail, password } = await parseBody(ctx, EmailChangeSchema);

  if (!user.passwordHash) {
    throw new HttpError(400, "validation_error", "Esta cuenta no tiene contraseña.");
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new HttpError(400, "validation_error", "La contraseña no es correcta.");
  }
  if (newEmail === user.email) {
    throw new HttpError(400, "validation_error", "Ese ya es tu correo actual.");
  }

  const taken = await prisma.user.findUnique({ where: { email: newEmail } });
  if (taken) {
    // Anti-enumeración: {ok} genérico + aviso al dueño del correo ocupado.
    await sendTemplate(templateRegistrationAttempt(taken.displayName), newEmail);
    return ctx.json({ ok: true });
  }

  const token = await issueToken(user.id, "EMAIL_CHANGE", newEmail);
  await sendTemplate(templateEmailChange(newEmail, token), newEmail);

  return ctx.json({ ok: true });
});
