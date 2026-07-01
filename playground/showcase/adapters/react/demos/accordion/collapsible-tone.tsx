import { Accordion } from '@magic-scope/react';

// collapsible:single 模式下允许点已展开项收起到「全部收起」;tone:展开 / hover / focus 配色。
export default function Demo() {
  return (
    <Accordion
      type="single"
      collapsible
      tone="accent"
      defaultValue="a"
      items={[
        {
          value: 'a',
          title: '可全部收起',
          content: '开启 collapsible 后,点当前展开项可收起到无展开态(默认不允许)。',
        },
        {
          value: 'b',
          title: 'tone 着色',
          content: 'tone=accent 让展开项标题与焦点环读 accent 槽位。',
        },
        { value: 'c', title: '第三项', content: '同一时刻仍只展开一项(single 模式)。' },
      ]}
    />
  );
}
