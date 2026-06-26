import { Accordion } from '@magic-scope/react';

// title / content 均为 ReactNode:可塞任意节点;disabled 项不可展开也不接收键盘焦点。
export default function Demo() {
  return (
    <Accordion
      type="single"
      defaultValue="ritual"
      items={[
        {
          value: 'ritual',
          title: (
            <span>
              仪式清单 <code>ritual</code>
            </span>
          ),
          content: (
            <ul style={{ margin: 0, paddingInlineStart: '1.2rem' }}>
              <li>校准奥术回路</li>
              <li>注入霜结协议</li>
              <li>封印余烬通道</li>
            </ul>
          ),
        },
        {
          value: 'sealed',
          title: '虚空封印 Void(禁用)',
          content: '此项被禁用,既不可展开也不会成为键盘焦点的落点。',
          disabled: true,
        },
        {
          value: 'log',
          title: '施法日志 Log',
          content: (
            <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
              内容区是 <code>role="region"</code> 并 <code>aria-labelledby</code> 关联头部。
            </p>
          ),
        },
      ]}
    />
  );
}
