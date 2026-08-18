import { describe, expect, it } from "vitest";
import { createReviewJob } from "./src/job.ts";

describe("createReviewJob", () => {
  it("为每个任务创建独立的可变集合", () => {
    const dependencies = {
      createId: () => "fixed-id",
      now: () => new Date("2026-01-01T00:00:00.000Z"),
    };
    const first = createReviewJob("first", dependencies);
    const second = createReviewJob("second", dependencies);

    first.tags.push("urgent");

    expect(first.tags).toEqual(["urgent"]);
    expect(second.tags).toEqual([]);
    expect(first.tags).not.toBe(second.tags);
  });

  it("拒绝空提示", () => {
    expect(() => createReviewJob("   ")).toThrow("审查提示不能为空");
  });
});
