import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000")
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid env vars", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/+$/, "");
}

const allowedOrigins = parsed.data.CORS_ORIGIN.split(",")
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

export const config = {
  ...parsed.data,
  allowedOrigins
};
