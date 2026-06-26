import { Checkbox, CheckboxGroup } from '@magic-scope/react';
import { useState } from 'react';

/**
 * CheckboxGroup 多选组:用 value(string[])受控,组内 Checkbox 自带 value 即自动判定 checked,
 * 切换回传新的选中数组。tone / size / disabled 在组上统一下发,无需逐项重复。
 */
export default function Demo() {
  const [picked, setPicked] = useState<string[]>(['evocation', 'illusion']);

  return (
    <div style={{ display: 'grid', gap: '0.8rem' }}>
      <CheckboxGroup tone="accent" value={picked} onChange={setPicked} orientation="horizontal">
        <Checkbox value="evocation">塑能</Checkbox>
        <Checkbox value="conjuration">咒法</Checkbox>
        <Checkbox value="illusion">惑控</Checkbox>
        <Checkbox value="necromancy">死灵</Checkbox>
      </CheckboxGroup>
      <span style={{ color: 'var(--ms-fg-muted)', fontSize: '0.85rem' }}>
        已选学派:{picked.length ? picked.join('、') : '(无)'}
      </span>
    </div>
  );
}
