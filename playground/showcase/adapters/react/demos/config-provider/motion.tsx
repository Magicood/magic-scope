import { Button, type ConfigMotion, ConfigProvider } from '@magic-scope/react';

const LEVELS: { key: ConfigMotion; label: string; hint: string }[] = [
  { key: 'on', label: 'motion="on" 满强度', hint: '全库过渡 / 动效满档' },
  { key: 'subtle', label: 'motion="subtle" 克制', hint: '动效更收敛(reduced 同档)' },
  { key: 'off', label: 'motion="off" 关闭', hint: '全库动效停,仅保留必要反馈' },
];

export default function Demo() {
  // motion → data-ms-motion 总闸。把鼠标移到按钮上感受过渡差异(off 时悬停几乎无动画)。
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-4)' }}>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>悬停下面按钮对比过渡强度</small>
      <div style={{ display: 'flex', gap: 'var(--ms-space-4)', flexWrap: 'wrap' }}>
        {LEVELS.map(({ key, label, hint }) => (
          <ConfigProvider
            key={key}
            motion={key}
            style={{
              display: 'grid',
              gap: 'var(--ms-space-2)',
              padding: 'var(--ms-space-4)',
              borderRadius: 'var(--ms-radius-md)',
              border: '1px solid var(--ms-color-border)',
            }}
          >
            <Button tone="accent">{label}</Button>
            <small style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.78rem' }}>{hint}</small>
          </ConfigProvider>
        ))}
      </div>
    </div>
  );
}
