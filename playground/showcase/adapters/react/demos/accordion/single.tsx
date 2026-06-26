import { Accordion } from '@magic-scope/react';

// single:同时只展开一项,展开新项时自动收起其余项。
export default function Demo() {
  return (
    <Accordion
      type="single"
      defaultValue="arcane"
      items={[
        {
          value: 'arcane',
          title: '奥术回路 Arcane',
          content: '展开/收起用 grid-template-rows: 0fr → 1fr 过渡,平滑且无需测量高度。',
        },
        {
          value: 'frost',
          title: '霜结协议 Frost',
          content: '头部为原生 <button>,带 aria-expanded / aria-controls,无障碍开箱即用。',
        },
        {
          value: 'ember',
          title: '余烬通道 Ember',
          content: '↑↓ 在头部间移动焦点,Home / End 跳首尾,Enter / Space 触发切换。',
        },
      ]}
    />
  );
}
