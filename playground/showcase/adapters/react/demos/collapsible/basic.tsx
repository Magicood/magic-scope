import { Collapsible } from '@magic-scope/react';

// 非受控最小用法:点击 Trigger 平滑展开 / 收起 Content。
export default function Demo() {
  return (
    <Collapsible defaultOpen style={{ inlineSize: 'min(340px, 100%)' }}>
      <Collapsible.Trigger
        style={{
          font: 'inherit',
          cursor: 'pointer',
          padding: '0.5rem 0.8rem',
          border: '1px solid var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-md)',
          background: 'transparent',
          color: 'var(--ms-color-fg)',
        }}
      >
        更新日志 ▾
      </Collapsible.Trigger>
      <Collapsible.Content>
        <ul
          style={{
            margin: '0.6rem 0 0',
            paddingInlineStart: '1.2rem',
            color: 'var(--ms-color-fg-muted)',
          }}
        >
          <li>新增 14 个组件的展示站覆盖</li>
          <li>修复浮层锚点跑位</li>
          <li>动效系统接入首页</li>
        </ul>
      </Collapsible.Content>
    </Collapsible>
  );
}
