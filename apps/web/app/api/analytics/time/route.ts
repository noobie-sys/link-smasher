import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { withApiHandler } from "@/lib/api-handler";
import { UnauthorizedError } from "@/lib/errors";

const timeSchema = z.object({
  sessions: z.array(
    z.object({
      hostname: z.string().min(1),
      durationMs: z.number().int().positive(),
      recordedAt: z.number().int().positive(),
    })
  ).min(1),
});

export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getAuthSession(request);
  if (!session) throw new UnauthorizedError();

  const body = await request.json();
  const { sessions } = timeSchema.parse(body);

  const result = await prisma.siteTimeLog.createMany({
    data: sessions.map((s) => ({
      userId: session.user.id,
      hostname: s.hostname,
      durationMs: BigInt(s.durationMs),
      recordedAt: BigInt(s.recordedAt),
      source: "extension",
    })),
  });

  return { success: true, inserted: result.count };
});
