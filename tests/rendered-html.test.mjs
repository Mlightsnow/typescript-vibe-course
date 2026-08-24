import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(pathname, "http://localhost/"), {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

}

test("renders development preview metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

for (const [pathname, expected] of [
  ["/", "让你判断得准"],
  ["/lesson/typescript-basics", "第一次读懂 TypeScript"],
  ["/lesson/ai-code-human-responsibility", "AI 写完代码后"],
  ["/lesson/async-is-a-protocol", "异步不是语法糖"],
  ["/roadmap", "从运行时事实"],
  ["/playground", "TypeScript Playground"],
  ["/project", "先把流式协议做对"],
]) {
  test(`renders ${pathname}`, async () => {
    const response = await render(pathname);
    assert.equal(response.status, 200);
    assert.match(await response.text(), new RegExp(expected));
  });
}

test("home starts at P00 and renders the course in P00 → M00 → M01 order", async () => {
  const response = await render("/");
  const html = await response.text();
  assert.match(html, /href=["']\/lesson\/typescript-basics["'][^>]*>\s*开始第一章/);
  const p00 = html.indexOf("P00");
  const m00 = html.indexOf("M00", p00 + 1);
  const m01 = html.indexOf("M01", m00 + 1);
  assert.ok(p00 >= 0 && p00 < m00 && m00 < m01);

  const p00Lesson = await (await render("/lesson/typescript-basics")).text();
  assert.match(p00Lesson, /href=["']\/lesson\/ai-code-human-responsibility["']/);
  const m00Lesson = await (await render("/lesson/ai-code-human-responsibility")).text();
  assert.match(m00Lesson, /href=["']\/lesson\/typescript-basics["']/);
});
