import { Prose } from '@magic-scope/react';

/**
 * Prose 不内置 dangerouslySetInnerHTML —— 是否信任这段 HTML 的安全决策交还调用方。
 * 渲染来自 markdown / CMS 的成块 HTML 字符串时,由你在内层元素上自行注入。
 */
const HTML = `
  <h2>来自 CMS 的富文本</h2>
  <p>这段内容是一个 <strong>HTML 字符串</strong>(模拟 markdown / CMS 的渲染结果)。</p>
  <p>调用方在内层 div 上用原生 <code>dangerouslySetInnerHTML</code> 注入,
     <code>Prose</code> 只负责套排版,安全边界清晰可控。</p>
  <ul>
    <li>列表标记走 tone</li>
    <li>链接:<a href="#prose">查看文档</a></li>
  </ul>
`;

export default function Demo() {
  return (
    <Prose tone="info" style={{ inlineSize: 'min(560px, 100%)' }}>
      {/* 注入点由调用方掌控:此处假设 HTML 已过滤/可信 */}
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: 演示「安全决策交还调用方」 */}
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </Prose>
  );
}
