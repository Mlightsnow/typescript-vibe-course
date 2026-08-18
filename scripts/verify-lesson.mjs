import { spawnSync } from "node:child_process";

const lessonId = (process.argv[2] ?? "").toUpperCase();
const supported = new Set(["M00", "M01", "M02"]);

if (!supported.has(lessonId)) {
  console.error("请选择已开放章节：M00、M01 或 M02。");
  process.exit(1);
}

const commands = [
  [process.execPath, ["node_modules/typescript/bin/tsc", "--noEmit"]],
];

if (lessonId === "M01") {
  commands.push([
    process.execPath,
    ["node_modules/vitest/vitest.mjs", "run", "examples/codepilot-cli/job.test.ts"],
  ]);
}

if (lessonId === "M02") {
  commands.push([
    process.execPath,
    ["node_modules/vitest/vitest.mjs", "run", "examples/codepilot-cli"],
  ]);
}

for (const [command, args] of commands) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`✓ ${lessonId} 验收通过`);
