import { packager } from "@electron/packager";
import { readFile } from "node:fs/promises";
const { version } = JSON.parse(await readFile("package.json", "utf8")) as {
  version: string;
};
if (!/^[0-9A-Za-z.-]+$/.test(version))
  throw new Error("Invalid package version");
const paths = await packager({
  dir: ".",
  name: "SignalKey",
  platform: "win32",
  arch: "x64",
  out: `release/${version}-integration`,
  overwrite: true,
  // Real sample processes need a filesystem cwd; an ASAR archive is not one.
  asar: false,
  ignore: [
    /^\/(tests|release|hardware|mechanical|manufacturing|firmware|docs|output|tmp|\.local)(\/|$)/,
  ],
  prune: true,
});
console.log(paths.join("\n"));
