import { prisma } from "@/lib/db";
import { HttpError, parseBody, publicUser, withRoute } from "@/server/http";
import { hashPassword, checkPasswordPolicy, passwordPolicyMessage } from "@/server/auth/password";
import { generateUniqueFarocode, generateUniqueHandle, slugify } from "@/server/auth/ids";
import { RegisterSchema } from "@/server/schemas";
import { sendTemplate, templateRegistrationAttempt, templateVerifyEmail } from "@/server/mailer";
import { issueToken } from "@/server/auth/tokens";
import { createSession } from "@/server/auth/session";

/**
 * POST /api/v1/auth/register · #1 · 02-cuentas-auth.md §5.1
 *
 * Anti-enumeración EXACTA: si el email ya existe, la respuesta es la misma
 * 201 genérica ({user, needsVerification}), PERO sin cookie de sesión, y al
 * dueño real le llega el aviso "alguien intentó registrarse".
 * RL: 5/h por IP.
 */

export const dynamic = "force-dynamic";

export const POST = withRoute({ route: "POST /api/v1/auth/register" }, async (ctx) => {
  ctx.rl(5, 60 * 60 * 1000, "ip");

  const body = await parseBody(ctx, RegisterSchema);
  const { email, displayName } = body;

  const policy = checkPasswordPolicy(body.password);
  if (!policy.ok) {
    throw new HttpError(400, "validation_error", passwordPolicyMessage(policy.reason!));
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Anti-enumeración: misma respuesta genérica, cero información.
    // Al dueño: aviso (best effort, no rompe el flujo).
    await sendTemplate(templateRegistrationAttempt(existing.displayName), email);
    const decoy = publicUser({
      id: `anon-${Date.now().toString(36)}`,
      email,
      displayName,
      handle: `${slugify(displayName)}-0000`,
      farocode: "",
      emailVerifiedAt: null,
      role: "USER",
      status: "ACTIVE",
      createdAt: new Date(),
    });
    // Ojo: SIN cookie de sesión (el atacante no entra a nada).
    return ctx.json({ user: decoy, needsVerification: true }, 201);
  }

  const [handle, farocode, passwordHash] = await Promise.all([
    generateUniqueHandle(displayName),
    generateUniqueFarocode(),
    hashPassword(body.password),
  ]);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName,
      handle,
      farocode,
    },
  });

  // Token de verificación (48 h) + correo.
  const token = await issueToken(user.id, "EMAIL_VERIFY");
  await sendTemplate(templateVerifyEmail(user.displayName, token), user.email);

  // Sesión + cookie: se juega desde el minuto 0 sin verificar.
  const { token: sessionToken } = await createSession(user.id, ctx.req);
  ctx.setSessionCookie(sessionToken);

  return ctx.json({ user: publicUser(user), needsVerification: true }, 201);
});
