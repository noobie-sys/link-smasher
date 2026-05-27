import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    // TODO: Add email verification once email provider (Resend/SendGrid) is configured
    // requireEmailVerification: true,
    // sendVerificationEmail: async ({ user, url }) => { ... },
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  plugins: [nextCookies()],
});

export type Auth = typeof auth;
