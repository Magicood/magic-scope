import { Checkbox } from '@magic-scope/react';
import { useState } from 'react';

const items = ['塑能', '咒法', '惑控'];

/**
 * 「全选」框的经典用法:子项全选则父框 checked,部分选中则 indeterminate(半选)。
 * indeterminate 只是视觉态,需配合 checked 与 onChange 自行联动。
 */
export default function Demo() {
  const [picked, setPicked] = useState<string[]>(['塑能']);
  const all = picked.length === items.length;
  const some = picked.length > 0 && !all;

  function toggle(name: string, on: boolean) {
    setPicked((prev) => (on ? [...prev, name] : prev.filter((x) => x !== name)));
  }

  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <Checkbox
        checked={all}
        indeterminate={some}
        onChange={(e) => setPicked(e.currentTarget.checked ? items : [])}
      >
        全选学派
      </Checkbox>
      <div style={{ display: 'grid', gap: '0.4rem', paddingInlineStart: '1.4rem' }}>
        {items.map((name) => (
          <Checkbox
            key={name}
            checked={picked.includes(name)}
            onChange={(e) => toggle(name, e.currentTarget.checked)}
          >
            {name}
          </Checkbox>
        ))}
      </div>
    </div>
  );
}
