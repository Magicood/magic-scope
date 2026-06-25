import { Radio, RadioGroup } from '@magic-scope/react';

export default function Demo() {
  return (
    <RadioGroup defaultValue="ember" orientation="horizontal" aria-label="横向排布">
      <Radio value="arcane">奥术</Radio>
      <Radio value="frost">冰霜</Radio>
      <Radio value="ember">烈焰</Radio>
    </RadioGroup>
  );
}
