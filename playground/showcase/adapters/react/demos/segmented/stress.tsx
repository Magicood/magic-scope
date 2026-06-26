import { Segmented } from '@magic-scope/react';
import { useState } from 'react';

// 对抗性:超长 label + 大量段 + 窄容器 + block 等分,验证不撑破布局、不裁焦点环。
const longOptions = [
  { value: 'a', label: '超长的分段标签文字会不会把布局撑破呢' },
  { value: 'b', label: '另一段同样很长的中文标签用来挤压空间' },
  { value: 'c', label: '第三段' },
];

const many = Array.from({ length: 9 }, (_, i) => ({
  value: `m${i + 1}`,
  label: `第 ${i + 1} 段`,
}));

export default function Demo() {
  const [value, setValue] = useState('a');
  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(360px, 100%)' }}>
      {/* 窄容器 + block:各段等分,超长 label 应在段内收敛而非溢出 */}
      <Segmented block options={longOptions} value={value} onValueChange={setValue} size="sm" />
      {/* 大量段:横向铺排,indicator 仍精确定位 */}
      <Segmented options={many} defaultValue="m1" size="sm" tone="info" />
    </div>
  );
}
