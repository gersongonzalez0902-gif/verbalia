import { createHash } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, parseBody, withRoute } from "@/server/http";
import { verifyPassword } from "@/server/auth/password";
import { sendMail } from "@/server/mailer";
import { Prisma } from "@/generated/prisma/client";

/**
 * DELETE /api/v1/auth/account · #13 · RL 2/día (usuario autenticado)
 *
 * Borrado con anonimización transaccional · 02-cuentas-auth.md §5.5:
 * 1. User.status=DELETED, email anon-<hash8>@deleted.local,
 *    displayName "Navegante fantasma", bio/avatar/banner/featuredBadge vacíos,
 *    handle/farocode anonimizados (unicidad a salvo).
 * 2. ProgressState borrado. Transcripciones (Json) limpiadas a null.
 * 3. StatDaily y TintaLedger se CONSERVAN (números huérfanos: el ranking
 *    no se rompe) apuntando al usuario anonimizado.
 * 4. Sesiones y tokens fuera.
 * 5. Email de despedida con ventana de arrepentimiento de 30 días.
 */

const DeleteAccountSchema = z.object({
  password: z.string().min(1).max(200),
});

export const dynamic = "force-dynamic";

export const DELETE = withRoute({ route: "DELETE /api/v1/auth/account" }, async (ctx) => {
  const { user } = await ctx.auth();
  ctx.rl(2, 24 * 60 * 60 * 1000, "user");

  const { password } = await parseBody(ctx, DeleteAccountSchema);

  if (!user.passwordHash) {
    throw new HttpError(400, "validation_error", "Esta cuenta no tiene contraseña.");
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new HttpError(400, "validation_error", "La contraseña no es correcta.");
  }

  const hash8 = createHash("sha256").update(user.id).digest("hex").slice(0, 8);
  const originalEmail = user.email;
  const originalName = user.displayName;

  // Transacción de anonimización (filas agregadas se conservan).
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        status: "DELETED",
        email: `anon-${hash8}@deleted.local`,
        displayName: "Navegante fantasma",
        handle: `fantasma-${hash8}`,
        farocode: `GHST-${hash8.toUpperCase()}`,
        bio: "",
        avatar: "",
        banner: "",
        featuredBadge: "",
        photo: "",
        passwordHash: null,
        emailVerifiedAt: null,
      },
    }),
    prisma.progressState.deleteMany({ where: { userId: user.id } }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
    prisma.verificationToken.deleteMany({ where: { userId: user.id } }),
    // Transcripciones fuera; los agregados quedan como números huérfanos.
    prisma.dailyChallengeEntry.updateMany({
      where: { userId: user.id },
      data: { transcript: Prisma.DbNull },
    }),
    prisma.duelParticipant.updateMany({
      where: { userId: user.id },
      data: { transcript: Prisma.DbNull },
    }),
  ]);

  // Email de despedida (al correo ORIGINAL) con ventana de arrepentimiento.
  await sendMail({
    to: originalEmail,
    subject: "Tu cuenta de VerbalIA ha sido borrada",
    html: `<!DOCTYPE html><html lang="es"><body style="margin:0;padding:0;background:#0f1226;font-family:system-ui,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 20px;color:#f5f3ff;">
<p style="font-size:20px;font-weight:800;margin:0 0 24px;color:#ff8fa3;">VerbalIA</p>
<div style="background:#1a1e3a;border-radius:16px;padding:28px;border:1px solid #2c3157;">
<h1 style="font-size:20px;margin:0 0 14px;">Adiós, ${originalName} 🌊</h1>
<div style="font-size:15px;line-height:1.6;color:#d9d6ef;">
<p>Tu cuenta ha sido borrada y tus datos personales anonimizados.</p>
<p>Si fue un error, tienes <strong>30 días</strong> para arrepentirte: responde a este
correo y la restauraremos desde la copia de seguridad.</p>
<p>Gracias por navegar con nosotros.</p>
</div></div>
<p style="font-size:12px;color:#8b8fb0;margin-top:20px;">VerbalIA · el archipiélago de juegos de lengua</p>
</div></body></html>`,
  });

  // La sesión actual también murió (deleteMany la incluyó).
  ctx.clearSessionCookie();
  return ctx.json({ ok: true });
});
