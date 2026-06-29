import { Accordion } from '@magic-scope/react';

// title / content 均为 ReactNode:可塞任意节点;disabled 项不可展开也不接收键盘焦点。
export default function Demo() {
  return (
    <Accordion
      type="single"
      defaultValue="checklist"
      items={[
        {
          value: 'checklist',
          title: (
            <span>
              上线清单 <code>checklist</code>
            </span>
          ),
          content: (
            <ul style={{ margin: 0, paddingInlineStart: '1.2rem' }}>
              <li>跑通端到端测试</li>
              <li>更新变更日志</li>
              <li>切换功能开关</li>
            </ul>
          ),
        },
        {
          value: 'archived',
          title: '历史版本(已归档,禁用)',
          content: '此项被禁用,既不可展开也不会成为键盘焦点的落点。',
          disabled: true,
        },
        {
          value: 'changelog',
          title: '变更日志 Changelog',
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
