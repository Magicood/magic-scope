import { Accordion } from '@magic-scope/react';

// multiple:各项独立展开,互不影响;defaultValue 传 string[] 同时展开多项。
export default function Demo() {
  return (
    <Accordion
      type="multiple"
      defaultValue={['shipping', 'returns']}
      items={[
        {
          value: 'shipping',
          title: '配送与时效',
          content: '多开模式下,本项与下方项可同时保持展开。',
        },
        {
          value: 'returns',
          title: '退换货政策',
          content: '初始即展开,点击头部独立收起,不影响其它项。',
        },
        {
          value: 'warranty',
          title: '保修与售后',
          content: '初始收起,展开它不会收起已展开的项。',
        },
      ]}
    />
  );
}
