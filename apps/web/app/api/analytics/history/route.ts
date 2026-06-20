import { NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { withApiHandler } from "@/lib/api-handler";
import { UnauthorizedError } from "@/lib/errors";

export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getAuthSession(request);
  if (!session) throw new UnauthorizedError();

  const userId = session.user.id;
  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * msPerDay;

  // Retrieve all links saved in the past 30 days
  const links = await prisma.link.findMany({
    where: {
      userId,
      createdAt: {
        gte: BigInt(thirtyDaysAgo),
      },
    },
    select: {
      createdAt: true,
    },
  });

  // Retrieve all time logs in the past 30 days
  const timeLogs = await prisma.siteTimeLog.findMany({
    where: {
      userId,
      recordedAt: {
        gte: BigInt(thirtyDaysAgo),
      },
    },
    select: {
      durationMs: true,
      recordedAt: true,
    },
  });

  // Group by day YYYY-MM-DD
  const dailyData: Record<string, { date: string; saves: number; activeMinutes: number }> = {};

  // Initialize past 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * msPerDay);
    const dateStr = d.toISOString().split("T")[0];
    dailyData[dateStr] = {
      date: dateStr,
      saves: 0,
      activeMinutes: 0,
    };
  }

  // Populate link counts
  for (const link of links) {
    const d = new Date(Number(link.createdAt));
    const dateStr = d.toISOString().split("T")[0];
    if (dailyData[dateStr]) {
      dailyData[dateStr].saves += 1;
    }
  }

  // Populate active minutes (duration_ms / 60,000)
  for (const log of timeLogs) {
    const d = new Date(Number(log.recordedAt));
    const dateStr = d.toISOString().split("T")[0];
    if (dailyData[dateStr]) {
      dailyData[dateStr].activeMinutes += Math.round(Number(log.durationMs) / 60000);
    }
  }

  const result = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

  return {
    success: true,
    data: result,
  };
});
