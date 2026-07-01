import { TagInput } from '@magic-scope/react';

// defaultValue 预置标签(非受控);delimiter 自定义分隔符(逗号 / 空格 / 分号均可断词);
// caseSensitive 控制去重是否区分大小写。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(360px, 100%)' }}>
      <TagInput
        defaultValue={['React', 'TypeScript']}
        delimiter={[',', ' ', ';']}
        placeholder="逗号 / 空格 / 分号均可断词"
      />
      <TagInput
        defaultValue={['Tag']}
        caseSensitive
        placeholder="caseSensitive:tag 与 Tag 视为不同标签"
      />
    </div>
  );
}
