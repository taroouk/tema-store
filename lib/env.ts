import "server-only";

import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(10),
  SUPABASE_SECRET_KEY: z.string().min(10),
  DATABASE_URL: z.string().startsWith("postgres"),
});

/** Fails fast with a readable message when required configuration is missing. */
export const env = schema.parse(process.env);
