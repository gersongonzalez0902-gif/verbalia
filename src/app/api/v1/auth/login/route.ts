import { prisma } from "@/lib/db";
import { parseBody, publicUser, withRoute } from "@/server/http";
import { getDummyHash, verifyPassword } from "@/server/auth/password";
import { createSession } from "@/server/auth/session";
import { LoginSchema } from "@/server/schemas";

/**
 * POST /api/v1/auth/login · #2 · 02-cuentas-auth.md §5.2
 *
 * Anti-enumeración: mensaje y tiempo IDÉNTICOS si el email no existe
 * (se compara contra un hash dummy con el mismo coste de scrypt).
 * RL: 10/15 min por IP y por cuenta.
 */

const CREDENCIALES_INVALIDAS = "Email o contraseña incorrectos.";
const WINDOW_15M = 15 * 60 * 1000;

export const dynamic = "force-dynamic";

export const POST = withRoute({ route: "POST /api/v1/auth/login" }, async (ctx) => {
  ctx.rl(10, WINDOW_15M, "ip");

  const body = await parseBody(ctx, LoginSchema);
  ctx.rl(10, WINDOW_15M, { account: body.email });

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) {
    // Mismo trabajo y mismo mensaje que si existiera (anti-enumeración).
    const dummy = await getDummyHash();
    await verifyPassword(body.password, dummy);
    return ctx.json(
      { error: { code: "unauthorized", message: CREDENCIALES_INVALIDAS } },
      401,
    );
  }

  const passwordOk = await verifyPassword(body.password, user.passwordHash ?? "");
  if (!passwordOk || user.status !== "ACTIVE") {
    // Estado no activo: mismo mensaje genérico (no se filtra nada).
    return ctx.json(
      { error: { code: "unauthorized", message: CREDENCIALES_INVALIDAS } },
      401,
    );
  }

  const { token } = await createSession(user.id, ctx.req);
  ctx.setSessionCookie(token);

  return ctx.json({ user: publicUser(user) });
});
