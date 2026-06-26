import { Watermark } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  return (
    <Watermark
      content={(values.content as string) || '@magic-scope'}
      rotate={values.rotate as number}
      opacity={values.opacity as number}
      fontSize={values.fontSize as number}
      fontColor={values.fontColor as string}
      zIndex={values.zIndex as number}
      style={{
        inlineSize: 'min(480px, 100%)',
        borderRadius: 'var(--ms-radius-lg)',
        border: '1px solid var(--ms-color-border)',
        background: 'var(--ms-color-surface)',
        overflow: 'hidden',
      }}
    >
      <article style={{ padding: 'var(--ms-space-5)', display: 'grid', gap: 'var(--ms-space-3)' }}>
        <h3 style={{ margin: 0, color: 'var(--ms-color-fg)' }}>季度营收复盘(机密)</h3>
        <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', lineHeight: 1.7 }}>
          这是一段受保护的正文。水印浮在内容之上,但你依然可以正常选中这段文字、点击下方按钮、滚动页面——
          覆盖层 pointer-events:none,从不拦截任何交互。
        </p>
        <button
          type="button"
          style={{
            justifySelf: 'start',
            padding: 'var(--ms-space-2) var(--ms-space-4)',
            borderRadius: 'var(--ms-radius-md)',
            border: 'none',
            background: 'var(--ms-color-primary)',
            color: 'var(--ms-color-bg)',
            cursor: 'pointer',
          }}
        >
          导出报表
        </button>
      </article>
    </Watermark>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/watermark/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/watermark/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'watermark',
  Playground,
  demos: buildDemos(comps, reactSources),
};
