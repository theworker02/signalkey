import { readFile, writeFile } from "node:fs/promises";
const manifest = JSON.parse(await readFile("package.json", "utf8")) as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};
const entries = await Promise.all(
  Object.entries({ ...manifest.dependencies, ...manifest.devDependencies }).map(
    async ([name, version]) => {
      const p = JSON.parse(
        await readFile(`node_modules/${name}/package.json`, "utf8"),
      );
      return {
        name,
        version,
        license: p.license ?? "review required",
        scope: name in manifest.dependencies ? "runtime" : "development",
      };
    },
  ),
);
await writeFile(
  "docs/dependency-inventory.json",
  JSON.stringify(
    {
      generated: new Date().toISOString(),
      scope:
        "Direct dependencies only; transitive and Chromium notices require release audit",
      entries,
    },
    null,
    2,
  ),
);
