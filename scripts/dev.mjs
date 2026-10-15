import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readdirSync, rmSync, copyFileSync, statSync, symlinkSync, readlinkSync, utimesSync, watch } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const projectHash = createHash("sha256").update(projectRoot.toLowerCase()).digest("hex").slice(0, 12);
const runtimeRoot = join(tmpdir(), `genect-buddy-dev-${projectHash}`);
const sourceDirectories = ["app", "components", "lib", "public"];
const rootFiles = ["package.json", "package-lock.json", "tsconfig.json", "next-env.d.ts"];

function mirrorDirectory(source, destination) {
  mkdirSync(destination, { recursive: true });
  const names = new Set(readdirSync(source));
  for (const name of names) {
    const from = join(source, name);
    const to = join(destination, name);
    const sourceStat = statSync(from);
    if (sourceStat.isDirectory()) {
      if (existsSync(to) && !statSync(to).isDirectory()) rmSync(to, { force: true });
      mirrorDirectory(from, to);
    } else if (sourceStat.isFile()) {
      if (existsSync(to) && !statSync(to).isFile()) rmSync(to, { recursive: true, force: true });
      const targetStat = existsSync(to) ? statSync(to) : null;
      if (!targetStat || sourceStat.size !== targetStat.size || sourceStat.mtimeMs !== targetStat.mtimeMs) {
        copyFileSync(from, to);
        utimesSync(to, sourceStat.atime, sourceStat.mtime);
      }
    }
  }
  for (const name of readdirSync(destination)) {
    if (!names.has(name)) rmSync(join(destination, name), { recursive: true, force: true });
  }
}

function mirrorSources() {
  for (const name of sourceDirectories) {
    const source = join(projectRoot, name);
    const destination = join(runtimeRoot, name);
    if (existsSync(source)) mirrorDirectory(source, destination);
  }
  for (const name of rootFiles) {
    const source = join(projectRoot, name);
    if (existsSync(source)) copyFileSync(source, join(runtimeRoot, name));
  }
}

mkdirSync(runtimeRoot, { recursive: true });
const moduleLink = join(runtimeRoot, "node_modules");
const moduleSource = join(projectRoot, "node_modules");
if (!existsSync(moduleSource)) {
  throw new Error("Dependencies are missing. Run npm.cmd install in the project folder.");
}
if (!existsSync(moduleLink)) {
  symlinkSync(moduleSource, moduleLink, "junction");
} else if (!lstatSync(moduleLink).isSymbolicLink() || resolve(readlinkSync(moduleLink)) !== moduleSource) {
  throw new Error(`Unexpected node_modules entry in ${runtimeRoot}. Remove that entry before starting.`);
}
mirrorSources();
loadEnvConfig(projectRoot, true);

let pending;
const watchers = [];
function queueMirror() {
  clearTimeout(pending);
  pending = setTimeout(() => {
    try { mirrorSources(); }
    catch (error) { console.error("Could not mirror a source change:", error); }
  }, 150);
}
for (const name of sourceDirectories) {
  const source = join(projectRoot, name);
  if (existsSync(source)) watchers.push(watch(source, { recursive: true }, queueMirror));
}
watchers.push(watch(projectRoot, (_event, filename) => {
  if (filename && rootFiles.includes(String(filename))) queueMirror();
}));

console.log(`GENECT source: ${projectRoot}`);
console.log(`Writable Next.js runtime: ${runtimeRoot}`);
const child = spawn(process.execPath, [join(moduleSource, "next", "dist", "bin", "next"), "dev", ...process.argv.slice(2)], {
  cwd: runtimeRoot,
  env: process.env,
  stdio: "inherit",
});
child.on("error", error => { console.error("Could not start Next.js:", error); process.exitCode = 1; });
child.on("exit", (code, signal) => {
  clearTimeout(pending);
  watchers.forEach(item => item.close());
  process.exitCode = code ?? (signal ? 1 : 0);
});
