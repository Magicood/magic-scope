import type { TourStep, TourTone } from '@magic-scope/react';
import { Button, Tour } from '@magic-scope/react';
import { type ComponentType, type CSSProperties, useRef, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const scopeRef = useRef<HTMLDivElement | null>(null);

  // 目标都限定在本演示卡内(取值器惰性解析,不污染整页)。
  const pick = (sel: string) => () => scopeRef.current?.querySelector(sel) ?? null;
  const steps: TourStep[] = [
    {
      target: pick('[data-tour="search"]'),
      title: '全局搜索',
      description: '在这里搜索任意组件、token 或文档,⌘K 也能唤起。',
    },
    {
      target: pick('[data-tour="theme"]'),
      title: '主题切换',
      description: '一键在内置主题预设之间切换,配色与动效实时生效。',
    },
    {
      target: pick('[data-tour="publish"]'),
      title: '发布',
      description: '改动满意后,从这里推送到 npm,全程有迹可循。',
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-4)', inlineSize: 'min(440px, 100%)' }}>
      <div
        ref={scopeRef}
        style={{
          display: 'flex',
          gap: 'var(--ms-space-3)',
          padding: 'var(--ms-space-4)',
          border: '1px solid var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-lg)',
          background: 'var(--ms-color-surface)',
        }}
      >
        <button type="button" data-tour="search" style={chip}>
          搜索
        </button>
        <button type="button" data-tour="theme" style={chip}>
          主题
        </button>
        <button type="button" data-tour="publish" style={chip}>
          发布
        </button>
      </div>

      <div>
        <Button
          onClick={() => {
            setCurrent(0);
            setOpen(true);
          }}
        >
          开始引导
        </Button>
      </div>

      <Tour
        steps={steps}
        open={open}
        current={current}
        onChange={setCurrent}
        onClose={() => setOpen(false)}
        onFinish={() => setOpen(false)}
        tone={values.tone as TourTone}
        spotlightPadding={values.spotlightPadding as number}
        maskClosable={values.maskClosable as boolean}
        closeOnEscape={values.closeOnEscape as boolean}
        showCounter={values.showCounter as boolean}
        hideSkip={values.hideSkip as boolean}
      />
    </div>
  );
}

const chip: CSSProperties = {
  padding: 'var(--ms-space-2) var(--ms-space-3)',
  border: '1px solid var(--ms-color-border)',
  borderRadius: 'var(--ms-radius-md)',
  background: 'var(--ms-color-bg)',
  color: 'var(--ms-color-fg)',
  font: 'inherit',
  cursor: 'pointer',
};

const comps = import.meta.glob<{ default: ComponentType }>('./demos/tour/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/tour/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'tour',
  Playground,
  demos: buildDemos(comps, reactSources),
};
