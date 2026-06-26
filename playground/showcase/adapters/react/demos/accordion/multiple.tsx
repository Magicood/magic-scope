import { Accordion } from '@magic-scope/react';

// multiple:各项独立展开,互不影响;defaultValue 传 string[] 同时展开多项。
export default function Demo() {
  return (
    <Accordion
      type="multiple"
      defaultValue={['arcane', 'frost']}
      items={[
        {
          value: 'arcane',
          title: '奥术回路 Arcane',
          content: '多开模式下,本项与下方项可同时保持展开。',
        },
        {
          value: 'frost',
          title: '霜结协议 Frost',
          content: '初始即展开,点击头部独立收起,不影响其它项。',
        },
        {
          value: 'ember',
          title: '余烬通道 Ember',
          content: '初始收起,展开它不会收起已展开的项。',
        },
      ]}
    />
  );
}
