import { z } from "zod";
import { HttpError, parseBody, withRoute } from "@/server/http";
import { importProgress } from "@/server/services/progress";
import { ProgressPayloadSchema } from "@/server/schemas";
import type { PersistedState } from "@/services/storage";

/**
 * POST /api/v1/progress/import · #16 (RL 3/día, email verificado)
 *
 * Migración de la bitácora local (02-cuentas-auth.md §7):
 * - Sin estado en el barco → se crea tal cual + entrada MIGRATION de tinta.
 * - Con estado → mergePayload (aditivo: nunca baja XP ni pierde logros).
 * - "Una vez": la entrada MIGRATION lleva refId único por usuario.
 * - Anti-abuso: requiere email verificado; NO otorga XP de ranking
 *   (StatDaily no se toca — el ranking se gana jugando conectado).
 */

export const dynamic = "force-dynamic";

export const POST = withRoute({ route: "POST /api/v1/progress/import" }, async (ctx) => {
  const { user } = await ctx.auth();
  ctx.rl(3, 24 * 60 * 60 * 1000, "user");

  if (!user.emailVerifiedAt) {
    throw new HttpError(
      403,
      "email_unverified",
      "Verifica tu correo antes de subir tu bitácora (mira tu bandeja de entrada).",
    );
  }

  const body = await parseBody(ctx, z.object({ payload: ProgressPayloadSchema }));

  const { merged, updatedAt } = await importProgress(
    user.id,
    body.payload as unknown as PersistedState,
  );

  return ctx.json({ merged, updatedAt: updatedAt.toISOString() });
});
