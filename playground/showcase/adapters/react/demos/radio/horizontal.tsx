import { Radio, RadioGroup } from '@magic-scope/react';

export default function Demo() {
  return (
    <RadioGroup defaultValue="month" orientation="horizontal" aria-label="横向排布">
      <Radio value="day">日</Radio>
      <Radio value="week">周</Radio>
      <Radio value="month">月</Radio>
    </RadioGroup>
  );
}
