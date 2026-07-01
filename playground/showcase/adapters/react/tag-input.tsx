import { TagInput, type TagInputSize, type TagInputTone } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [tags, setTags] = useState<string[]>(['设计', '前端']);

  return (
    <div style={{ inlineSize: 'min(420px, 100%)' }}>
      <TagInput
        value={tags}
        onChange={setTags}
        size={values.size as TagInputSize}
        tone={values.tone as TagInputTone}
        maxTags={values.maxTags as number}
        allowDuplicates={values.allowDuplicates as boolean}
        editable={values.editable as boolean}
        clearable={values.clearable as boolean}
        addOnBlur={values.addOnBlur as boolean}
        invalid={values.invalid as boolean}
        disabled={values.disabled as boolean}
        placeholder={(values.placeholder as string) || '输入后回车添加…'}
      />
      <p style={{ margin: '0.5rem 0 0', color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        {tags.length} 枚:{tags.join(' / ') || '(空)'}
      </p>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/tag-input/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/tag-input/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'tag-input',
  Playground,
  demos: buildDemos(comps, reactSources),
};
