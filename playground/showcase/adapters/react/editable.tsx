import { Editable, type EditableSize, type EditableTone } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [value, setValue] = useState('新品发布会 · 排期草案');

  return (
    <div style={{ inlineSize: 'min(360px, 100%)' }}>
      <Editable
        value={value}
        onChange={setValue}
        size={values.size as EditableSize}
        tone={values.tone as EditableTone}
        multiline={values.multiline as boolean}
        selectAllOnFocus={values.selectAllOnFocus as boolean}
        submitOnBlur={values.submitOnBlur as boolean}
        invalid={values.invalid as boolean}
        disabled={values.disabled as boolean}
        placeholder={(values.placeholder as string) || '点击编辑标题'}
        inputAriaLabel="标题"
      />
      <p style={{ margin: '0.5rem 0 0', color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前值:{value || '(空)'}
      </p>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/editable/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/editable/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'editable',
  Playground,
  demos: buildDemos(comps, reactSources),
};
