import type { AffixTarget } from '@magic-scope/react';
import { Affix } from '@magic-scope/react';
import { useRef } from 'react';

// 自定义滚动容器:getTarget 返回内部滚动元素(而非 window),
// 吸附判定相对该容器进行。多面板 / 侧栏 / 抽屉里的局部吸附都靠它。
export default function Demo() {
  const scrollRef = useRef<HTMLDivElement>(null);
  // 显式标注 AffixTarget 类型,体现导出的类型契约。
  const getTarget: AffixTarget = () => scrollRef.current ?? window;

  return (
    <div
      ref={scrollRef}
      style={{
        height: 240,
        overflow: 'auto',
        border: '1px dashed var(--ms-color-accent, #6d4aff)',
        borderRadius: 'var(--ms-radius-lg, 0.75rem)',
        background: 'var(--ms-color-bg-subtle, rgba(0,0,0,0.02))',
        padding: 'var(--ms-space-3, 0.75rem)',
      }}
    >
      <div style={{ height: 100, color: 'var(--ms-color-fg-muted, #888)' }}>
        这是一个独立滚动容器(虚线框),Affix 相对它而非整页吸附。
      </div>
      <Affix getTarget={getTarget} offsetTop={8}>
        <div
          style={{
            padding: 'var(--ms-space-2, 0.5rem) var(--ms-space-3, 0.75rem)',
            borderRadius: 'var(--ms-radius-md, 0.5rem)',
            background: 'var(--ms-color-bg-elevated, #fff)',
            border: '1px solid var(--ms-color-border, rgba(0,0,0,0.12))',
            boxShadow: 'var(--ms-shadow-2, 0 4px 12px rgba(0,0,0,0.12))',
            fontWeight: 600,
          }}
        >
          局部吸顶(getTarget = 虚线容器)
        </div>
      </Affix>
      <div
        style={{
          height: 520,
          paddingTop: 'var(--ms-space-4, 1rem)',
          color: 'var(--ms-color-fg-muted, #888)',
        }}
      >
        在此容器内滚动即可触发,整页滚动不影响。
      </div>
    </div>
  );
}
