import type { Metadata } from "next";
import { PlaygroundHub } from "@/components/playground-hub";

export const metadata: Metadata = {
  title: "TypeScript Playground",
  description: "在隔离的浏览器 Worker 中编辑、类型检查并运行课程示例。",
};

export default function PlaygroundPage() {
  return <PlaygroundHub />;
}
