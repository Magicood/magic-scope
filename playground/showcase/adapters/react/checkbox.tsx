import { Checkbox, type CheckboxSize, type CheckboxTone } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

/**
 * 受控演示:把 defaultChecked 旋钮的初始值接进局部 state,
 * 并以 key 让旋钮切换时重置勾选状态,这样方块既能点击切换、又能实时反映旋钮。
 * indeterminate 是纯视觉态(不改变 checked),直接透传旋钮值。
 */
function Playground({ values }: { values: ControlValues }) {
  const initial = values.defaultChecked as boolean;
  const [checked, setChecked] = useState(initial);
  const description = values.description as string;
  return (
    <Checkbox
      key={String(initial)}
      checked={checked}
      onChange={(e) => setChecked(e.currentTarget.checked)}
      tone={values.tone as CheckboxTone}
      size={values.size as CheckboxSize}
      description={description ? description : undefined}
      indeterminate={values.indeterminate as boolean}
      disabled={values.disabled as boolean}
    >
      {values.children as string}
    </Checkbox>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/checkbox/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/checkbox/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'checkbox',
  Playground,
  demos: buildDemos(comps, reactSources),
};
