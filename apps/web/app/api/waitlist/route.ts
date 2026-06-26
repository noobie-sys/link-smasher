import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withApiHandler } from "@/lib/api-handler";
import { ConflictError, ValidationError } from "@/lib/errors";

const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

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

  // Check if already registered
  const existing = await prisma.waitlistEntry.findUnique({
    where: { email: cleanEmail },
  });

  if (existing) {
    throw new ConflictError("You are already on the waitlist!");
  }

  // Create entry
  const entry = await prisma.waitlistEntry.create({
    data: { email: cleanEmail },
  });

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
