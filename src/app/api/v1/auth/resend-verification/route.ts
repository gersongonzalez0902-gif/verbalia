import { withRoute } from "@/server/http";
import { clearTokens, issueToken } from "@/server/auth/tokens";
import { sendTemplate, templateVerifyEmail } from "@/server/mailer";

/**
 * POST /api/v1/auth/resend-verification · #6 · RL 3/h (por usuario)
 * Reenvía el correo de verificación. Si ya está verificado: {ok} sin hacer nada.
 */

export const dynamic = "force-dynamic";

export const POST = withRoute({ route: "POST /api/v1/auth/resend-verification" }, async (ctx) => {
  const { user } = await ctx.auth();
  ctx.rl(3, 60 * 60 * 1000, "user");

  if (user.emailVerifiedAt) {
    return ctx.json({ ok: true, alreadyVerified: true });
  }

  // Un solo enlace vivo por usuario: los previos se retiran.
  await clearTokens(user.id, "EMAIL_VERIFY");
  const token = await issueToken(user.id, "EMAIL_VERIFY");
  await sendTemplate(templateVerifyEmail(user.displayName, token), user.email);

  return ctx.json({ ok: true });
});
