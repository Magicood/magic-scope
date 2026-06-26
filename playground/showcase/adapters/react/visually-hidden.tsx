import { VisuallyHidden } from '@magic-scope/react';
import type { ComponentType, ElementType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const as = values.as as ElementType;
  const focusable = values.focusable as boolean;
  const text = (values.children as string) || '仅屏幕阅读器可读的说明文字';

  // VisuallyHidden 无可见形态:用「视觉镜像」并排展示它对 SR 暴露了什么。
  // focusable=true 时,渲染为可聚焦的 <a>,Tab 聚焦后会从隐身浮现还原可见 —— 试着点下面卡片再按 Tab。
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--ms-space-4)',
        padding: 'var(--ms-space-5)',
        borderRadius: 'var(--ms-radius-lg)',
        border: '1px solid var(--ms-color-border)',
        background: 'var(--ms-color-bg-subtle)',
        inlineSize: 'min(460px, 100%)',
      }}
    >
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        {focusable
          ? 'focusable=true：点这张卡片后按 Tab，下面的隐藏链接会浮现还原可见'
          : '下方真实渲染了一个 VisuallyHidden（视觉隐身、SR 可读）'}
      </small>

      {/* 真实组件:视觉上不可见;focusable 时为可聚焦锚点,聚焦浮现 */}
      <div style={{ position: 'relative', minBlockSize: 'var(--ms-space-8)' }}>
        {focusable ? (
          <VisuallyHidden as="a" href="#ms-vh-target" focusable tabIndex={0}>
            {text}
          </VisuallyHidden>
        ) : (
          <VisuallyHidden as={as}>{text}</VisuallyHidden>
        )}
        <span style={{ color: 'var(--ms-color-fg-muted)', fontStyle: 'italic' }}>
          ← 这里有内容,但视觉上看不见
        </span>
      </div>

      {/* 视觉镜像:把 SR 实际朗读到的文字显式画出来,便于在展示站对照 */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--ms-space-2)',
          alignItems: 'center',
          padding: 'var(--ms-space-3)',
          borderRadius: 'var(--ms-radius-md)',
          border: '1px dashed var(--ms-color-border)',
          background: 'var(--ms-color-bg)',
        }}
      >
        <span aria-hidden style={{ fontSize: '1.1rem' }}>
          🔊
        </span>
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
          屏幕阅读器读到:
        </span>
        <strong style={{ color: 'var(--ms-color-fg)' }}>{text}</strong>
      </div>

      <small id="ms-vh-target" style={{ color: 'var(--ms-color-fg-subtle)' }}>
        根标签 as=&quot;{focusable ? 'a' : String(as)}&quot;
      </small>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/visually-hidden/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/visually-hidden/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'visually-hidden',
  Playground,
  demos: buildDemos(comps, reactSources),
};
