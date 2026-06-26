import { Radio, RadioGroup } from '@magic-scope/react';
import { useState } from 'react';

// appearance=card:整行渲染为可点描边卡片,选中染柔底 + 主色边 + 辉光,圆点仍在。
// 配合 tone 可改卡片选中色;这里用 accent 凸显与默认 control 外观的差异。
export default function Demo() {
  const [plan, setPlan] = useState('arcane');
  return (
    <RadioGroup
      value={plan}
      onValueChange={setPlan}
      appearance="card"
      tone="accent"
      aria-label="订阅方案"
      style={{ inlineSize: 'min(320px, 100%)' }}
    >
      <Radio value="arcane">Arcane 奥术 · 基础</Radio>
      <Radio value="frost">Frost 冰霜 · 进阶</Radio>
      <Radio value="ember">Ember 烈焰 · 旗舰</Radio>
      <Radio value="void" disabled>
        Void 虚空 · 暂未开放
      </Radio>
    </RadioGroup>
  );
}
