import { z } from "zod";
export const runRecordSchema = z
  .object({
    id: z.string(),
    profileId: z.string(),
    profileName: z.string(),
    source: z.enum(["button", "desktop", "sdk"]),
    startedAt: z.string().datetime(),
    finishedAt: z.string().datetime(),
    durationMs: z.number().nonnegative(),
    state: z.enum(["success", "failure", "cancelled", "interrupted"]),
    exitCode: z.number().int().nullable(),
    summary: z.string().max(500),
  })
  .strict();
export type RunRecord = z.infer<typeof runRecordSchema>;
