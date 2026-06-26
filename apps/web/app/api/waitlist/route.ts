import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withApiHandler } from "@/lib/api-handler";
import { ConflictError, ValidationError } from "@/lib/errors";

const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type WaitlistRow = {
  id: string;
  email: string;
  createdAt: Date;
};

/**
 * POST /api/waitlist
 * Registers a new email for the waitlist.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError("Invalid request body. Expected JSON.");
  }

  const { email } = waitlistSchema.parse(body);
  const cleanEmail = email.toLowerCase().trim();

  const [entry] = await prisma.$queryRaw<WaitlistRow[]>`
    INSERT INTO waitlist_entries (email)
    VALUES (${cleanEmail})
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email, created_at AS "createdAt"
  `;

  if (!entry) {
    throw new ConflictError("You are already on the waitlist!");
  }

  return {
    success: true,
    message: "Thank you for joining the waitlist!",
    data: {
      id: entry.id,
      email: entry.email,
      createdAt: entry.createdAt,
    },
  };
});
