import { TagInput } from '@magic-scope/react';
import { useState } from 'react';

// 非受控最小用法:回车 / 逗号成 tag,芯片可点 × 删除,空输入 Backspace 删尾。
export default function Demo() {
  const [tags, setTags] = useState<string[]>(['react', 'vue']);
  return (
    <div style={{ inlineSize: 'min(380px, 100%)' }}>
      <TagInput value={tags} onChange={setTags} placeholder="输入技术栈后回车…" />
    </div>
  );
}
