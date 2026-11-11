import { z } from "zod";
import { withRoute } from "@/server/http";
import { statsMe } from "@/server/services/progress";

/**
 * GET /api/v1/stats/me?window=7d|30d · #18
 * → {days: StatDaily[], streakOfficial} (la racha oficial es server-side:
 * días con ≥1 sesión validada, no lo que diga el cliente).
 */

export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  window: z.enum(["7d", "30d"]).default("7d"),
});

export const GET = withRoute({ route: "GET /api/v1/stats/me" }, async (ctx) => {
  const { user } = await ctx.auth();

  const parsed = QuerySchema.safeParse(
    Object.fromEntries(new URL(ctx.req.url).searchParams.entries()),
  );
  const window = parsed.success ? parsed.data.window : "7d";

  const result = await statsMe(user.id, window);
  return ctx.json(result);
});
