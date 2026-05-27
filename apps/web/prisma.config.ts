import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
