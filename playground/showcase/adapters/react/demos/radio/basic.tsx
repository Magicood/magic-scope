import { Radio, RadioGroup } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [school, setSchool] = useState('frost');
  return (
    <RadioGroup value={school} onValueChange={setSchool} aria-label="法术流派">
      <Radio value="arcane">Arcane 奥术</Radio>
      <Radio value="frost">Frost 冰霜</Radio>
      <Radio value="ember">Ember 烈焰</Radio>
      <Radio value="void" disabled>
        Void 虚空(单项禁用)
      </Radio>
    </RadioGroup>
  );
}
