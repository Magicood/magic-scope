import { Select } from '@magic-scope/react';
import { useState } from 'react';

// 对抗性内容:超长无空格串 + 巨量文本,验证 trigger 单行紧凑、
// 选项在浮层内被收在边界内(不撑破布局、不裁焦点环)。
const options = [
  {
    value: 'long-url',
    label:
      'https://grimoire.magic-scope.dev/spells/teleportation-circle?ritual=true&components=verbal,somatic,material',
  },
  {
    value: 'no-space',
    label: 'AbyssalIncantationWithoutAnyBreakingSpacesWhatsoeverThatKeepsGoingAndGoing',
  },
  {
    value: 'prose',
    label:
      '一段刻意写得很长的说明文本,用来检验当选项文本远超容器宽度时,浮层依旧能把它收在边界内并优雅换行或截断,而不会把触发器或列表撑破。',
  },
];

export default function Demo() {
  const [value, setValue] = useState('long-url');
  return (
    <div style={{ inlineSize: 'min(280px, 80vw)' }}>
      <Select value={value} onChange={setValue} options={options} aria-label="超长内容压力测试" />
    </div>
  );
}
