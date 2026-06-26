import type { AffixClassNames } from '@magic-scope/react';
import { Affix } from '@magic-scope/react';
import { useRef } from 'react';

// classNames 细粒度槽位:root(外层占位容器) / content(被 fixed 的内容层)。
// 配合 [data-affixed] / [data-mode] 属性,可只在吸附态叠加视觉(这里给吸附态加发光描边)。
const slots: AffixClassNames = {
  root: 'ms-demo-affix-root',
  content: 'ms-demo-affix-content',
};

export default function Demo() {
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={stageRef}
      style={{
        height: 240,
        overflow: 'auto',
        border: '1px solid var(--ms-color-border, rgba(0,0,0,0.12))',
        borderRadius: 'var(--ms-radius-lg, 0.75rem)',
        background: 'var(--ms-color-bg-subtle, rgba(0,0,0,0.02))',
        padding: 'var(--ms-space-3, 0.75rem)',
      }}
    >
      {/* 局部样式:仅吸附态(data-affixed)给 content 叠加发光描边,体现「只在吸附时定制视觉」。 */}
      <style>{`
        .ms-affix[data-affixed] > .ms-demo-affix-content > .ms-demo-pill {
          border-color: var(--ms-color-accent, #6d4aff);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--ms-color-accent, #6d4aff) 35%, transparent);
        }
      `}</style>
      <div style={{ height: 120, color: 'var(--ms-color-fg-muted, #888)' }}>
        向下滚动看吸附态发光描边。
      </div>
      <Affix getTarget={() => stageRef.current ?? window} offsetTop={0} classNames={slots}>
        <span
          className="ms-demo-pill"
          style={{
            display: 'inline-block',
            padding: 'var(--ms-space-2, 0.5rem) var(--ms-space-4, 1rem)',
            borderRadius: 'var(--ms-radius-md, 0.5rem)',
            background: 'var(--ms-color-bg-elevated, #fff)',
            border: '1px solid var(--ms-color-border, rgba(0,0,0,0.12))',
            fontWeight: 600,
            transition: 'box-shadow 120ms ease, border-color 120ms ease',
          }}
        >
          吸附态高亮
        </span>
      </Affix>
      <div style={{ height: 480, color: 'var(--ms-color-fg-muted, #888)' }}>正文……</div>
    </div>
  );
}
