import type { AffixHandle } from '@magic-scope/react';
import { Affix } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 命令式重测:ref 经 useImperativeHandle 暴露 measure()。
// 当布局在非滚动 / 非 resize 路径下变化(如展开折叠、异步插入内容),
// 主动调用 measure() 立即重判吸附,避免短暂错位。
export default function Demo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const affixRef = useRef<AffixHandle>(null);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(420px, 100%)' }}
    >
      <button
        type="button"
        onClick={() => {
          setExpanded((v) => !v);
          // 内容高度即将变化:下一帧主动重测,确保吸附基准立刻更新。
          requestAnimationFrame(() => affixRef.current?.measure());
        }}
        style={{
          justifySelf: 'start',
          padding: 'var(--ms-space-2, 0.5rem) var(--ms-space-4, 1rem)',
          borderRadius: 'var(--ms-radius-md, 0.5rem)',
          border: '1px solid var(--ms-color-border, rgba(0,0,0,0.12))',
          background: 'var(--ms-color-bg-elevated, #fff)',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        {expanded ? '收起头部' : '展开头部'} → 调用 measure()
      </button>

      <div
        ref={stageRef}
        style={{
          height: 220,
          overflow: 'auto',
          border: '1px solid var(--ms-color-border, rgba(0,0,0,0.12))',
          borderRadius: 'var(--ms-radius-lg, 0.75rem)',
          background: 'var(--ms-color-bg-subtle, rgba(0,0,0,0.02))',
          padding: 'var(--ms-space-3, 0.75rem)',
        }}
      >
        <div style={{ height: 100, color: 'var(--ms-color-fg-muted, #888)' }}>
          滚动并切换头部高度试试。
        </div>
        <Affix ref={affixRef} getTarget={() => stageRef.current ?? window} offsetTop={0}>
          <div
            style={{
              padding: 'var(--ms-space-3, 0.75rem)',
              borderRadius: 'var(--ms-radius-md, 0.5rem)',
              background: 'var(--ms-color-bg-elevated, #fff)',
              border: '1px solid var(--ms-color-border, rgba(0,0,0,0.12))',
              boxShadow: 'var(--ms-shadow-2, 0 4px 12px rgba(0,0,0,0.12))',
              fontWeight: 600,
            }}
          >
            可变高度头部
            {expanded && (
              <div
                style={{
                  marginBlockStart: 'var(--ms-space-2, 0.5rem)',
                  fontWeight: 400,
                  color: 'var(--ms-color-fg-muted, #888)',
                }}
              >
                展开后的副标题 —— measure() 已重算占位与吸附基准。
              </div>
            )}
          </div>
        </Affix>
        <div style={{ height: 480, color: 'var(--ms-color-fg-muted, #888)' }}>正文……</div>
      </div>
    </div>
  );
}
