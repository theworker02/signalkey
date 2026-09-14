import { build } from "esbuild";
import { build as viteBuild } from "vite";
await build({
  entryPoints: ["apps/desktop/main.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: "dist/main.cjs",
  external: ["electron", "node-hid"],
});
await build({
  entryPoints: ["apps/desktop/preload.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: "dist/preload.cjs",
  external: ["electron"],
});
await viteBuild({
  root: "apps/desktop/ui",
  base: "./",
  build: { outDir: "../../../dist/ui", emptyOutDir: true },
});
