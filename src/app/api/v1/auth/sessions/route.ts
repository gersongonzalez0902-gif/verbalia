import { prisma } from "@/lib/db";
import { withRoute } from "@/server/http";
/**
 * GET /api/v1/auth/sessions · #11
 * Lista de dispositivos activos: {items: [{id, deviceHint, userAgent,
 * createdAt, lastSeenAt, expiresAt, current}]}, sin IP ni token.
 */

export const dynamic = "force-dynamic";

export const GET = withRoute({ route: "GET /api/v1/auth/sessions" }, async (ctx) => {
  const { user, session } = await ctx.auth();

  const rows = await prisma.session.findMany({
    where: { userId: user.id, expiresAt: { gt: new Date() } },
    orderBy: { lastSeenAt: "desc" },
    take: 50,
  });

  return ctx.json({
    items: rows.map((s) => ({
      id: s.id,
      deviceHint: s.deviceHint,
      userAgent: s.userAgent,
      createdAt: s.createdAt.toISOString(),
      lastSeenAt: s.lastSeenAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
      current: s.id === session.id,
    })),
  });
});
