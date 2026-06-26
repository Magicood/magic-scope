import { NumberInput } from '@magic-scope/react';

// prefix / suffix:框内前置 / 后置内容(单位文字或图标),
// 与数字区同处一个描边控件内,不挤占步进按钮的触控热区。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(280px, 90vw)' }}>
      <div style={{ display: 'grid', gap: '0.35rem', fontSize: '0.8125rem' }}>
        <span style={{ color: 'var(--ms-color-fg-muted)' }}>金额 · prefix 货币符号</span>
        <NumberInput defaultValue={1280} min={0} step={10} prefix="¥" aria-label="金额" />
      </div>
      <div style={{ display: 'grid', gap: '0.35rem', fontSize: '0.8125rem' }}>
        <span style={{ color: 'var(--ms-color-fg-muted)' }}>百分比 · suffix 单位</span>
        <NumberInput defaultValue={60} min={0} max={100} step={5} suffix="%" aria-label="百分比" />
      </div>
      <div style={{ display: 'grid', gap: '0.35rem', fontSize: '0.8125rem' }}>
        <span style={{ color: 'var(--ms-color-fg-muted)' }}>重量 · prefix + suffix 同时</span>
        <NumberInput
          defaultValue={2.5}
          min={0}
          step={0.5}
          prefix="约"
          suffix="kg"
          aria-label="重量"
        />
      </div>
    </div>
  );
}
