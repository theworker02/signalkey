import { z } from "zod";
const safeString = z
  .string()
  .refine((s) => !s.includes("\0"), "NUL characters are not allowed");
const idSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/);
export const bindingSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("none") }).strict(),
  z.object({ kind: z.literal("cancel") }).strict(),
  z.object({ kind: z.literal("run"), profileId: idSchema.optional() }).strict(),
]);
export type Binding = z.infer<typeof bindingSchema>;
export const defaultBindings = () => ({
  press: { kind: "run" } as Binding,
  double: { kind: "none" } as Binding,
  hold: { kind: "cancel" } as Binding,
});
export const profileSchema = z
  .object({
    version: z.literal(2),
    id: idSchema,
    name: z.string().trim().min(1).max(80),
    executable: safeString.pipe(z.string().min(1).max(1024)),
    args: z.array(safeString.pipe(z.string().max(4096))).max(64),
    cwd: safeString.pipe(z.string().min(1).max(2048)),
    timeoutMs: z.number().int().min(100).max(3600000),
    enabled: z.boolean(),
    brightness: z.number().int().min(0).max(64),
    bindings: z
      .object({
        press: bindingSchema,
        double: bindingSchema,
        hold: bindingSchema,
      })
      .strict(),
  })
  .strict();
export type Profile = z.infer<typeof profileSchema>;
export function migrateProfile(value: unknown): Profile {
  if (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === 0
  ) {
    const v = value as Record<string, unknown>;
    value = { ...v, version: 1, brightness: 32 };
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === 1
  ) {
    value = {
      ...value,
      version: 2,
      bindings: {
        ...defaultBindings(),
        double: { kind: "run", profileId: "sample-fail" },
      },
    };
  }
  return profileSchema.parse(value);
}
export function importProfile(value: unknown): Profile {
  const p = migrateProfile(value);
  // Imported references cannot silently bind to an already-enabled local command.
  for (const gesture of ["press", "double", "hold"] as const) {
    if (p.bindings[gesture].kind === "run")
      p.bindings[gesture] = { kind: "run" };
  }
  return { ...p, enabled: false };
}
