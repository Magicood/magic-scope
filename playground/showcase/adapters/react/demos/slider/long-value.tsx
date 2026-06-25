import { Slider } from '@magic-scope/react';

export default function Demo() {
  // 对抗性:formatValue 返回超长无空格串,验证末尾 output 被收在边界内,
  // 不把轨道挤变形、不撑破容器、不裁掉滑块的焦点环。
  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(360px, 80vw)' }}>
      <Slider
        defaultValue={42}
        showValue
        formatValue={(n) =>
          `当前充能进度${n}%超长无空格演示文本MagicScopeSliderOverflowGuardABCDEFGHIJKLMNOP`
        }
        aria-label="超长数值文本"
      />
    </div>
  );
}
