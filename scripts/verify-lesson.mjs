import { spawnSync } from "node:child_process";

const lessonId = (process.argv[2] ?? "").toUpperCase();
const supported = new Set(["P00", "M00", "M01", "M02"]);

if (!supported.has(lessonId)) {
  console.error("请选择已开放章节：P00、M00、M01 或 M02。");
  process.exit(1);
}

const commands = [
  [process.execPath, ["node_modules/typescript/bin/tsc", "--noEmit"]],
];

if (lessonId === "P00") {
  const result = spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      "--input-type=module",
      "--eval",
      `import { lessons, labs } from "./lib/course.ts";
       const lesson = lessons.find((item) => item.id === "P00");
       if (!lesson || lesson.slug !== "typescript-basics" || lesson.sections.length < 8) process.exit(2);
       if (lesson.labIds.length < 3) process.exit(3);
       for (const id of lesson.labIds) {
         const lab = labs[id];
         if (!lab?.initialCode || !lab.expectedDiagnostics || !lab.expectedOutput || !lab.solution) process.exit(4);
       }
       if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(lesson.slug)) process.exit(5);`,
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

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
