import { Segmented } from '@magic-scope/react';
import { useState } from 'react';

// fullWidth:块级铺满容器宽度(各段等分),适合放进卡片头或工具栏。
const options = [
  { value: 'list', label: '列表' },
  { value: 'board', label: '看板' },
  { value: 'calendar', label: '日历' },
];

export default function Demo() {
  const [value, setValue] = useState('board');
  return (
    <div style={{ inlineSize: 'min(420px, 100%)' }}>
      <Segmented options={options} value={value} onValueChange={setValue} fullWidth />
    </div>
  );
}
