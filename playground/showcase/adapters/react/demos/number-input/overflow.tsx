import { NumberInput } from '@magic-scope/react';

// 对抗性:极大数值 / 超长数字串塞进窄容器,验证控件被收在边界内
// (input 区域内部容纳,描边控件整体不被撑破,步进按钮与焦点环不被裁切)。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(220px, 80vw)' }}>
      <NumberInput defaultValue={9007199254740991} step={1000000} aria-label="极大数值" />
      <NumberInput defaultValue={12345678.90123456} step={0.0001} aria-label="超长小数" />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        极大 / 超长数字在窄容器内:控件不撑破,数字区可内部滚动。
      </small>
    </div>
  );
}
