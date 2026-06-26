import type { RadioOption } from '@magic-scope/react';
import { RadioGroup } from '@magic-scope/react';
import { useState } from 'react';

// options 数据驱动入口:用数组渲染选项,与 children 二选一。
// label 缺省回退到 value,disabled 可单项禁用,适合配置来自接口的场景。
const OPTIONS: RadioOption[] = [
  { value: 'arcane', label: 'Arcane 奥术' },
  { value: 'frost', label: 'Frost 冰霜' },
  { value: 'ember', label: 'Ember 烈焰' },
  { value: 'void', label: 'Void 虚空(禁用)', disabled: true },
];

export default function Demo() {
  const [school, setSchool] = useState('frost');
  return (
    <RadioGroup
      value={school}
      onValueChange={setSchool}
      options={OPTIONS}
      tone="info"
      aria-label="法术流派(数据驱动)"
    />
  );
}
