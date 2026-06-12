import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { withApiHandler } from "@/lib/api-handler";
import { UnauthorizedError } from "@/lib/errors";

const eventsSchema = z.object({
  events: z.array(
    z.object({
      hostname: z.string().min(1),
      eventType: z.string().min(1),
      source: z.string().min(1),
      occurredAt: z.number().int().positive(),
    })
  ).min(1),
});

export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getAuthSession(request);
  if (!session) throw new UnauthorizedError();

  const body = await request.json();
  const { events } = eventsSchema.parse(body);

  const result = await prisma.linkEvent.createMany({
    data: events.map((e) => ({
      userId: session.user.id,
      hostname: e.hostname,
      eventType: e.eventType,
      source: e.source,
      occurredAt: BigInt(e.occurredAt),
    })),
  });

  return { success: true, inserted: result.count };
});
