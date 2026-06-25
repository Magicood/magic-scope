import { useState } from 'react';
import type { FrameworkId } from '../core/types';

const FRAMEWORKS: { id: FrameworkId; label: string }[] = [
  { id: 'react', label: 'React' },
  { id: 'vue', label: 'Vue' },
  { id: 'angular', label: 'Angular' },
];

/**
 * 代码块：默认收起、点击展开;顶部按框架(React/Vue/Angular)切换源码,
 * 现仅 react 有源,vue/angular 显示「待」占位(多框架预留)。
 */
export function CodeBlock({
  sources,
  defaultOpen = false,
}: {
  sources: Partial<Record<FrameworkId, string>>;
  defaultOpen?: boolean;
}) {
  const firstAvailable = FRAMEWORKS.find((f) => sources[f.id])?.id ?? 'react';
  const [active, setActive] = useState<FrameworkId>(firstAvailable);
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const code = (sources[active] ?? '').trim();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // 忽略剪贴板失败（无权限等）
    }
  };

  return (
    <div className="sc-codeblock" data-open={open ? '' : undefined}>
      <div className="sc-codeblock__bar">
        <div className="sc-codeblock__tabs">
          {FRAMEWORKS.map((f) => {
            const has = Boolean(sources[f.id]);
            return (
              <button
                key={f.id}
                type="button"
                className="sc-codetab"
                data-active={active === f.id ? '' : undefined}
                disabled={!has}
                title={has ? undefined : '敬请期待'}
                onClick={() => has && setActive(f.id)}
              >
                {f.label}
                {!has && <span className="sc-codetab__soon">待</span>}
              </button>
            );
          })}
        </div>
        <div className="sc-codeblock__actions">
          {open && (
            <button type="button" className="sc-codebtn" onClick={copy}>
              {copied ? '已复制 ✓' : '复制'}
            </button>
          )}
          <button
            type="button"
            className="sc-codebtn"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? '收起代码 ▲' : '展开代码 ▼'}
          </button>
        </div>
      </div>
      {open && (
        <pre className="sc-code sc-code--demo">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
