import { Radio, RadioGroup } from '@magic-scope/react';
import { useState } from 'react';

// appearance=card:整行渲染为可点描边卡片,选中染柔底 + 主色边 + 光晕,圆点仍在。
// 配合 tone 可改卡片选中色;这里用 accent 凸显与默认 control 外观的差异。
export default function Demo() {
  const [plan, setPlan] = useState('starter');
  return (
    <RadioGroup
      value={plan}
      onValueChange={setPlan}
      appearance="card"
      tone="accent"
      aria-label="订阅方案"
      style={{ inlineSize: 'min(320px, 100%)' }}
    >
      <Radio value="starter">Starter · 基础版</Radio>
      <Radio value="pro">Pro · 进阶版</Radio>
      <Radio value="enterprise">Enterprise · 旗舰版</Radio>
      <Radio value="custom" disabled>
        Custom · 暂未开放
      </Radio>
    </RadioGroup>
  );
}
