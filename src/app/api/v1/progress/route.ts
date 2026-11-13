import { z } from "zod";
import { HttpError, parseBody, withRoute } from "@/server/http";
import { getProgress, putProgress } from "@/server/services/progress";
import { DeltasSchema, ProgressPayloadSchema } from "@/server/schemas";
import type { PersistedState } from "@/services/storage";

/**
 * GET /api/v1/progress · #14 → {version, payload, updatedAt}
 * 404 not_found si aún no hay estado en el barco (cuenta recién creada).
 *
 * PUT /api/v1/progress · #15 (RL 30/h) · {baseUpdatedAt?, payload, deltas?}
 * → 200 {merged, updatedAt, conflicts?}
 * → 409 conflict_outdated + {merged, updatedAt} (el cliente ADOPTA el merged:
 *    el servidor ya mezcló su payload contra la versión más nueva).
 */

export const dynamic = "force-dynamic";

export const GET = withRoute({ route: "GET /api/v1/progress" }, async (ctx) => {
  const { user } = await ctx.auth();
  const remote = await getProgress(user.id);
  if (!remote) {
    throw new HttpError(404, "not_found", "Aún no hay progreso guardado en el barco.");
  }
  return ctx.json({
    version: remote.version,
    payload: remote.payload,
    updatedAt: remote.updatedAt.toISOString(),
  });
});

export const PUT = withRoute({ route: "PUT /api/v1/progress" }, async (ctx) => {
  const { user } = await ctx.auth();
  ctx.rl(30, 60 * 60 * 1000, "user");

  const body = await parseBody(
    ctx,
    z.object({
      baseUpdatedAt: z.string().datetime().nullish(),
      payload: ProgressPayloadSchema,
      deltas: DeltasSchema,
    }),
  );

  const outcome = await putProgress(user.id, {
    baseUpdatedAt: body.baseUpdatedAt ?? null,
    payload: body.payload as unknown as PersistedState,
    deltas: body.deltas ?? null,
  });

  if (outcome.status === 409) {
    // La base local era más vieja: el servidor YA mezcló; el cliente adopta.
    return ctx.json(
      {
        error: {
          code: "conflict_outdated",
          message: "El barco tenía una versión más nueva: aquí va el estado unido.",
          // El estado unido viaja en meta para que el cliente lo adopte tal cual.
          meta: {
            merged: outcome.merged,
            updatedAt: outcome.updatedAt.toISOString(),
            conflicts: outcome.conflicts,
          },
        },
      },
      409,
    );
  }

  return ctx.json({
    merged: outcome.merged,
    updatedAt: outcome.updatedAt.toISOString(),
    ...(outcome.conflicts.length > 0 ? { conflicts: outcome.conflicts } : {}),
  });
});
