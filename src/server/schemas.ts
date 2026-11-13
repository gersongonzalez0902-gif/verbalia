/**
 * Esquemas zod compartidos de /api/v1 · Ola D · Área 2.
 *
 * Antes cada ruta llevaba sus esquemas en local (y el payload de
 * progreso era tan generoso que cualquier cosa pasaba). Ahora viven
 * aquí, con límites honestos de tamaño y rango, y las rutas y los
 * tests beben de la misma fuente: lo que se valida es lo que se
 * prueba.
 */

import { z } from "zod";
import { normalizeEmail } from "./auth/ids";

/** Login: email normalizado (trim + minúsculas) y LUEGO validado,
 *  para que "  Ana@Mar.Es " entre como ana@mar.es y no rebote. */
export const LoginSchema = z.object({
  email: z.string().max(320).transform(normalizeEmail).pipe(z.email()),
  password: z.string().min(1).max(200),
});

/** Registro: igual que login + nombre visible acotado. */
export const RegisterSchema = z.object({
  email: z.string().max(320).transform(normalizeEmail).pipe(z.email()),
  password: z.string().min(1).max(200),
  displayName: z.string().trim().min(1).max(40),
});

/**
 * Payload de progreso (PUT /progress y POST /progress/import).
 * Se mantiene tolerante en FORMA (mergePayload sanea la estructura),
 * pero acotado en TAMAÑO y RANGO: nombres y bios humanos, fotos como
 * data-URL de tamaño razonable, XP dentro de lo jugable y un jardín
 * SRS de tamaño creíble. Nada de sobres infinitos.
 */
export const ProgressPayloadSchema = z
  .object({
    version: z.number().int().min(1).max(100).optional(),
    profile: z
      .object({
        name: z.string().min(1).max(60),
        bio: z.string().max(500).optional(),
        photo: z.string().max(500_000).optional(),
        banner: z.string().max(700_000).optional(),
        featuredBadge: z.string().max(80).nullish(),
      })
      .passthrough(),
    settings: z.record(z.string().max(64), z.unknown()).optional(),
    core: z.object({ xp: z.number().min(0).max(1_000_000_000) }).passthrough(),
    srs: z
      .record(z.string().max(80), z.unknown())
      .refine((cards) => Object.keys(cards).length <= 30_000, {
        message: "El jardín SRS enviado es demasiado grande.",
      })
      .optional(),
    savedAt: z.number().min(0).max(9_999_999_999_999).optional(),
  })
  .passthrough();

/** Deltas acumulados desde la base (PUT /progress). */
export const DeltasSchema = z
  .object({
    stats: z
      .record(
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        z.object({
          xp: z.number().min(0).optional(),
          correct: z.number().min(0).optional(),
          sessions: z.number().min(0).optional(),
        }),
      )
      .optional(),
    scalars: z
      .object({
        totalAnswers: z.number().min(0).optional(),
        totalCorrect: z.number().min(0).optional(),
        totalSessions: z.number().min(0).optional(),
        totalTimeMs: z.number().min(0).optional(),
        answerTimeSumMs: z.number().min(0).optional(),
      })
      .optional(),
  })
  .nullish();
