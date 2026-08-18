import { createReviewJob } from "./job.ts";
import {
  MockReviewProvider,
  type ReviewStreamEvent,
} from "./review-stream.ts";

function printEvent(event: ReviewStreamEvent) {
  switch (event.type) {
    case "review.started":
      console.log(`◇ review.started · ${event.jobId}`);
      break;
    case "review.delta":
      process.stdout.write(`│ ${event.text}`);
      break;
    case "review.completed":
      console.log(`◆ review.completed · ${event.findingCount} 条检查\n`);
      break;
    case "review.cancelled":
      console.log(`\n◇ review.cancelled · ${event.reason}\n`);
      break;
    case "review.failed":
      console.error(`\n✕ review.failed · ${event.message}\n`);
      break;
  }
}

async function main() {
  const prompt = process.argv.slice(2).join(" ").trim();
  if (!prompt) {
    console.error('用法：npm run codepilot -- "审查这段任务队列代码"');
    process.exitCode = 1;
    return;
  }

  const controller = new AbortController();
  let interruptCount = 0;
  const onInterrupt = () => {
    interruptCount += 1;
    if (interruptCount === 1) {
      process.stdout.write("\n正在取消…再按一次 Ctrl+C 立即退出。\n");
      controller.abort("用户按下 Ctrl+C");
      return;
    }
    process.exit(130);
  };

  process.on("SIGINT", onInterrupt);

  try {
    const job = createReviewJob(prompt);
    const provider = new MockReviewProvider();
    for await (const event of provider.review(job, controller.signal)) {
      printEvent(event);
      if (event.type === "review.failed") process.exitCode = 1;
      if (event.type === "review.cancelled") process.exitCode = 130;
    }
  } finally {
    process.off("SIGINT", onInterrupt);
  }
}

await main();
