import { Collapsible } from '@magic-scope/react';

// 拼装 FAQ 列表:每行一个独立 Collapsible,互不互斥(与 Accordion 的分组语义相区别)。
const qa = [
  ['如何安装?', '运行 pnpm add @magic-scope/react,并按需引入 styles.css。'],
  ['支持哪些框架?', '当前以 React 为基准,Vue / Web Component 在路线图 Phase 2。'],
  ['如何切换主题?', '通过 ConfigProvider 或根节点的 data-ms-* 属性一键切换配色 / 动效。'],
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.5rem', inlineSize: 'min(400px, 100%)' }}>
      {qa.map(([q, a]) => (
        <Collapsible key={q}>
          <Collapsible.Trigger
            style={{
              display: 'flex',
              inlineSize: '100%',
              justifyContent: 'space-between',
              font: 'inherit',
              cursor: 'pointer',
              padding: '0.6rem 0.8rem',
              border: '1px solid var(--ms-color-border)',
              borderRadius: 'var(--ms-radius-md)',
              background: 'transparent',
              color: 'var(--ms-color-fg)',
            }}
          >
            <span>{q}</span>
            <span aria-hidden="true">＋</span>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <p style={{ margin: '0.5rem 0.2rem 0', color: 'var(--ms-color-fg-muted)' }}>{a}</p>
          </Collapsible.Content>
        </Collapsible>
      ))}
    </div>
  );
}
