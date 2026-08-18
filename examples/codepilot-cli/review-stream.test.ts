import { afterEach, describe, expect, it, vi } from "vitest";
import { createReviewJob } from "./src/job.ts";
import {
  isTerminalEvent,
  MockReviewProvider,
  type ReviewStreamEvent,
} from "./src/review-stream.ts";

function testJob() {
  return createReviewJob("review this", {
    createId: () => "job-test",
    now: () => new Date("2026-01-01T00:00:00.000Z"),
  });
}

afterEach(() => {
  vi.useRealTimers();
});

describe("MockReviewProvider", () => {
  it("正常流只产生一个终止事件", async () => {
    vi.useFakeTimers();
    const events: ReviewStreamEvent[] = [];
    const provider = new MockReviewProvider({
      chunks: ["one", "two"],
      delayMs: 100,
    });
    const collecting = (async () => {
      for await (const event of provider.review(
        testJob(),
        new AbortController().signal,
      )) {
        events.push(event);
      }
    })();

    await vi.runAllTimersAsync();
    await collecting;

    expect(events.map((event) => event.type)).toEqual([
      "review.started",
      "review.delta",
      "review.delta",
      "review.completed",
    ]);
    expect(events.filter(isTerminalEvent)).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("取消后不再产生 delta，并清理 timer", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const provider = new MockReviewProvider({
      chunks: ["one", "too late"],
      delayMs: 100,
    });
    const iterator = provider.review(testJob(), controller.signal)[
      Symbol.asyncIterator
    ]();

    expect((await iterator.next()).value?.type).toBe("review.started");

    const firstDelta = iterator.next();
    await vi.advanceTimersByTimeAsync(100);
    expect((await firstDelta).value).toEqual({
      type: "review.delta",
      text: "one",
    });

    const pending = iterator.next();
    controller.abort("test cancellation");
    const cancelled = await pending;

    expect(cancelled.value).toEqual({
      type: "review.cancelled",
      reason: "test cancellation",
    });
    await vi.advanceTimersByTimeAsync(1_000);
    expect((await iterator.next()).done).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});
