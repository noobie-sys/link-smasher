import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { getAuthSession } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { withApiHandler } from "@/lib/api-handler";
import { UnauthorizedError } from "@/lib/errors";

interface TopSiteRow {
  hostname: string;
  total_ms: bigint;
}

export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getAuthSession(request);
  if (!session) throw new UnauthorizedError();

  const userId = session.user.id;
  const now = Date.now();
  const msPerDay = 86_400_000;
  const startOfWeek = now - 7 * msPerDay;
  const startOfLastWeek = now - 14 * msPerDay;

  const [totalLinks, savedThisWeek, savedLastWeek, topSitesByTime] =
    await Promise.all([
      prisma.link.count({ where: { userId } }),
      prisma.link.count({
        where: { userId, createdAt: { gte: BigInt(startOfWeek) } },
      }),
      prisma.link.count({
        where: {
          userId,
          createdAt: { gte: BigInt(startOfLastWeek), lt: BigInt(startOfWeek) },
        },
      }),
      prisma.$queryRaw<TopSiteRow[]>(
        Prisma.sql`
          SELECT hostname, SUM(duration_ms) AS total_ms
          FROM site_time_logs
          WHERE user_id = ${userId}
          GROUP BY hostname
          ORDER BY total_ms DESC
          LIMIT 5
        `
      ),
    ]);

  const weekOverWeekDelta =
    savedLastWeek === 0
      ? null
      : Math.round(((savedThisWeek - savedLastWeek) / savedLastWeek) * 100);

  return {
    success: true,
    data: {
      totalLinks,
      savedThisWeek,
      savedLastWeek,
      weekOverWeekDelta,
      topSitesByTime: topSitesByTime.map((row) => ({
        hostname: row.hostname,
        totalMs: Number(row.total_ms),
      })),
    },
  };
});
