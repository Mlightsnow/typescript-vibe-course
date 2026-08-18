export type ReviewJob = Readonly<{
  id: string;
  prompt: string;
  tags: string[];
  createdAt: Date;
}>;

type JobDependencies = {
  createId?: () => string;
  now?: () => Date;
};

export function createReviewJob(
  prompt: string,
  dependencies: JobDependencies = {},
): ReviewJob {
  const normalized = prompt.trim();
  if (!normalized) {
    throw new Error("审查提示不能为空。");
  }

  return {
    id: (dependencies.createId ?? (() => crypto.randomUUID()))(),
    prompt: normalized,
    tags: [],
    createdAt: (dependencies.now ?? (() => new Date()))(),
  };
}
