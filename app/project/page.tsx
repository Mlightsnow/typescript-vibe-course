import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, Command, KeyRound, Radio, ShieldCheck } from "lucide-react";

const checks = [
  "事件是可判别联合，而不是不可解释的裸字符串",
  "正常、失败、取消只会产生一个终止事件",
  "取消后不再产生增量，并释放所有 timer",
  "CLI 与 Provider 解耦，测试不依赖真实模型",
];

export default function ProjectPage() {
  return (
    <main className="wide-page project-page">
      <header className="page-heading project-heading">
        <span className="block-eyebrow static-text"><Command size={15} /> CODEPILOT · P0</span>
        <h1>先把流式协议做对，<br />再连接任何模型。</h1>
        <p>当前里程碑是一个可取消、可测试的 Mock 代码审查 CLI。它为后续 REST、SSE、队列与 OpenAI 兼容 Provider 提供稳定内核。</p>
      </header>

      <div className="project-status-grid">
        <section className="project-command-card">
          <span className="block-eyebrow evidence-text">立即运行</span>
          <h2>Mock 流式审查</h2>
          <div className="command-display">
            <span>$</span><code>npm run codepilot -- &quot;审查任务队列&quot;</code>
          </div>
          <p>第一次 Ctrl+C 发出取消信号；第二次立即退出。无需网络或 API Key。</p>
        </section>

        <section className="architecture-card">
          <span>入口</span><i /><span>事件协议</span><i /><span>Mock Provider</span>
          <small>CLI 负责展示 · 领域层负责语义 · Provider 负责增量</small>
        </section>
      </div>

      <section className="acceptance-section">
        <div>
          <span className="block-eyebrow runtime-text"><ShieldCheck size={15} /> P0 验收契约</span>
          <h2>让测试证明取消真的发生了。</h2>
        </div>
        <ul>{checks.map((check) => <li key={check}><CheckCircle2 size={18} />{check}</li>)}</ul>
      </section>

      <section className="provider-later-card">
        <div className="provider-icon"><KeyRound size={22} /></div>
        <div>
          <span className="block-eyebrow">后续配置</span>
          <h2>OpenAI 兼容 API Provider</h2>
          <p>这一扩展点已保留，但本版本不读取密钥、不安装模型 SDK，也不发送网络请求。配置凭据后再实现。</p>
        </div>
        <span className="later-badge"><CircleDashed size={15} /> LATER</span>
      </section>

      <section className="project-next">
        <Radio size={20} />
        <div><strong>下一步：P1 HTTP + SSE</strong><span>用原生 Node 把同一事件协议暴露为流式接口。</span></div>
        <Link href="/roadmap">查看路线 <ArrowRight size={16} /></Link>
      </section>
    </main>
  );
}
