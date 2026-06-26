import { Mark } from '@magic-scope/react';
import { useMemo, useState } from 'react';

// 实时检索:输入框驱动 search,命中片段随输入即时高亮 —— 搜索结果关键词定位的典型用法。
// Mark 无专有事件回调(纯展示组件),这里用受控输入实时回显命中段数,演示其驱动方式。
const CORPUS =
  'magic-scope 是可发布到 npm 的多框架 UI 组件库与自动化收录流水线。每个组件都带溯源元数据,整个库可搜索、可追溯。Mark 把命中搜索词的片段高亮出来,适配契约框架无关。';

export default function Demo() {
  const [query, setQuery] = useState('可');
  const hits = useMemo(() => {
    if (!query) return 0;
    return CORPUS.split(query).length - 1;
  }, [query]);

  return (
    <div style={{ display: 'grid', gap: '0.6rem', maxInlineSize: 'min(560px, 100%)' }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="输入要检索的关键词…"
        aria-label="检索关键词"
        style={{
          padding: '0.4rem 0.6rem',
          borderRadius: 'var(--ms-radius-sm)',
          border: '1px solid var(--ms-color-border)',
          background: 'var(--ms-color-bg, transparent)',
          color: 'var(--ms-color-fg)',
          font: 'inherit',
        }}
      />
      <p style={{ lineHeight: 1.9, margin: 0 }}>
        <Mark search={query} tone="primary">
          {CORPUS}
        </Mark>
      </p>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        关键词「{query || '—'}」命中 {hits} 处
      </small>
    </div>
  );
}
