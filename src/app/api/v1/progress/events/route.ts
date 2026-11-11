import { z } from "zod";
import { HttpError, parseBody, withRoute } from "@/server/http";
import { recordEvent, type EventSessionInput } from "@/server/services/progress";

/**
 * POST /api/v1/progress/events · #17 (RL 60/h) · 04-api.md §3.1
 *
 * El corazón anti-trampa: el cliente sube la transcripción de la sesión
 * {answers: [{i, choice, ms}]} + su resultado; el servidor valida suelos
 * (ms ≥ 120), techos (combo, XP por respuesta) y aplica el tope diario de
 * freeplay antes de escribir StatDaily y TintaLedger.
 *
 * Idempotencia: la cabecera `Idempotency-Key` (el id del item de la cola
 * offline) se refleja en TintaLedger.refId → los reintentos no duplican.
 *
 * Ola 1: solo origen freeplay (el replay con semilla del servidor llega
 * con la Ola 2: engine/online.ts).
 */

export const dynamic = "force-dynamic";

const AnswerSchema = z.object({
  i: z.number().int().min(0),
  choice: z.number().int().min(-1),
  ms: z.number().int().min(0).max(3_600_000),
});

const SessionSchema = z.object({
  session: z.object({
    formatId: z.string().min(1).max(64),
    origin: z.string().regex(/^[a-z]+(:[\w-]+)?$/, "freeplay | daily | duel:<id> | ghost:<id>"),
    seed: z.string().max(128).nullish(),
    durationMs: z.number().int().min(0).max(86_400_000),
    transcript: z.object({ answers: z.array(AnswerSchema).min(1).max(500) }),
    result: z.object({
      xp: z.number().min(0),
      correct: z.number().int().min(0),
      total: z.number().int().min(0),
      bestCombo: z.number().int().min(0),
      accuracy: z.number().min(0).max(1).optional(),
    }),
  }),
});

export const POST = withRoute({ route: "POST /api/v1/progress/events" }, async (ctx) => {
  const { user } = await ctx.auth();
  ctx.rl(60, 60 * 60 * 1000, "user");

  const body = await parseBody(ctx, SessionSchema);
  const session = body.session;

  // Ola 1: solo freeplay. daily/duel/ghost llegan con sus olas (replay server).
  if (session.origin !== "freeplay") {
    throw new HttpError(
      400,
      "validation_error",
      "Ese origen de sesión todavía no está disponible en línea.",
    );
  }

  const idempotencyKey = ctx.req.headers.get("idempotency-key");

  const result = await recordEvent(user.id, session as unknown as EventSessionInput, idempotencyKey);
  return ctx.json(result);
});
