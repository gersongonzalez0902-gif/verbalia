import { z } from "zod";
import { prisma } from "@/lib/db";
import { parseBody, withRoute } from "@/server/http";
import { normalizeEmail } from "@/server/auth/ids";
import { clearTokens, issueToken } from "@/server/auth/tokens";
import { sendTemplate, templatePasswordReset } from "@/server/mailer";

/**
 * POST /api/v1/auth/password/forgot · #7 · RL 3/h por IP
 * Siempre {ok} (anti-enumeración). Si el correo existe: token 1 h + email.
 */

const ForgotSchema = z.object({
  email: z.email().max(254).transform(normalizeEmail),
});

export const dynamic = "force-dynamic";

export const POST = withRoute({ route: "POST /api/v1/auth/password/forgot" }, async (ctx) => {
  ctx.rl(3, 60 * 60 * 1000, "ip");

  const { email } = await parseBody(ctx, ForgotSchema);

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.status === "ACTIVE") {
    // Un solo enlace vivo: los previos se retiran.
    await clearTokens(user.id, "PASSWORD_RESET");
    const token = await issueToken(user.id, "PASSWORD_RESET");
    await sendTemplate(templatePasswordReset(user.displayName, token), user.email);
  }

  // Siempre la misma respuesta, exista o no el correo.
  return ctx.json({ ok: true });
});
