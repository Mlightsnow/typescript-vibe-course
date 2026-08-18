import type { ReviewJob } from "./job.ts";

export type ReviewStreamEvent =
  | { type: "review.started"; jobId: string }
  | { type: "review.delta"; text: string }
  | { type: "review.completed"; findingCount: number }
  | { type: "review.cancelled"; reason: string }
  | { type: "review.failed"; message: string };

export type ReviewProvider = {
  review(job: ReviewJob, signal: AbortSignal): AsyncIterable<ReviewStreamEvent>;
};

export class ReviewCancelledError extends Error {
  readonly reason: string;

  constructor(reason: string) {
    super(reason);
    this.name = "ReviewCancelledError";
    this.reason = reason;
  }
}

function cancellationReason(signal: AbortSignal) {
  if (typeof signal.reason === "string" && signal.reason.trim()) {
    return signal.reason;
  }
  if (signal.reason instanceof Error && signal.reason.message) {
    return signal.reason.message;
  }
  return "审查已取消";
}

export function abortableDelay(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    return Promise.reject(new ReviewCancelledError(cancellationReason(signal)));
  }

  return new Promise((resolve, reject) => {
    const finish = () => {
      cleanup();
      resolve();
    };
    const cancel = () => {
      cleanup();
      reject(new ReviewCancelledError(cancellationReason(signal)));
    };
    const timer = setTimeout(finish, ms);
    const cleanup = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
    };
    signal.addEventListener("abort", cancel, { once: true });
  });
}

const defaultChunks = [
  "检查输入边界：外部数据应从 unknown 开始。\n",
  "检查异步协议：取消信号需要贯穿每个等待点。\n",
  "检查测试证据：取消后不应再出现 delta，timer 必须清理。\n",
];

export class MockReviewProvider implements ReviewProvider {
  private readonly options: {
    chunks?: string[];
    delayMs?: number;
  };

  constructor(
    options: {
      chunks?: string[];
      delayMs?: number;
    } = {},
  ) {
    this.options = options;
  }

  async *review(
    job: ReviewJob,
    signal: AbortSignal,
  ): AsyncGenerator<ReviewStreamEvent> {
    const chunks = this.options.chunks ?? defaultChunks;
    const delayMs = this.options.delayMs ?? 180;

    yield { type: "review.started", jobId: job.id };

    try {
      for (const text of chunks) {
        await abortableDelay(delayMs, signal);
        yield { type: "review.delta", text };
      }
      yield { type: "review.completed", findingCount: chunks.length };
    } catch (error) {
      if (error instanceof ReviewCancelledError || signal.aborted) {
        yield {
          type: "review.cancelled",
          reason:
            error instanceof ReviewCancelledError
              ? error.reason
              : cancellationReason(signal),
        };
        return;
      }

      yield {
        type: "review.failed",
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export function isTerminalEvent(event: ReviewStreamEvent) {
  return (
    event.type === "review.completed" ||
    event.type === "review.cancelled" ||
    event.type === "review.failed"
  );
}
