import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const result = spawnSync("ego-browser", ["nodejs"], {
  input: readFileSync(new URL("../test/calculator.browser.mjs", import.meta.url), "utf8"),
  encoding: "utf8",
  timeout: 120_000,
});
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
