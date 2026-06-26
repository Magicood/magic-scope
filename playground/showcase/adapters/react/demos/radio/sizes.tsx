import { Radio, RadioGroup } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      <RadioGroup defaultValue="a" size="sm" orientation="horizontal" aria-label="sm">
        <Radio value="a">sm</Radio>
        <Radio value="b">选项</Radio>
      </RadioGroup>
      <RadioGroup defaultValue="a" size="md" orientation="horizontal" aria-label="md">
        <Radio value="a">md</Radio>
        <Radio value="b">选项</Radio>
      </RadioGroup>
      <RadioGroup defaultValue="a" size="lg" orientation="horizontal" aria-label="lg">
        <Radio value="a">lg</Radio>
        <Radio value="b">选项</Radio>
      </RadioGroup>
    </div>
  );
}
