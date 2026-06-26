import { ConfigProvider, Empty } from '@magic-scope/react';

const box = {
  display: 'grid',
  gap: 'var(--ms-space-3)',
  padding: 'var(--ms-space-4)',
  borderRadius: 'var(--ms-radius-md)',
  border: '1px solid var(--ms-color-border)',
} as const;

export default function Demo() {
  // messages:内部用 MessagesProvider 合并下发文案,覆盖 i18n key。
  // locale:写到根元素 lang(便于 hyphens / 字体回退 / 读屏语种),不做内置文案切换。
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-4)' }}>
      {/* 默认文案:Empty 不传 description 时走 i18n empty.description = 「暂无数据」 */}
      <ConfigProvider style={box}>
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>
          默认 messages —— Empty 显示「暂无数据」
        </small>
        <Empty />
      </ConfigProvider>

      {/* 覆盖 messages:empty.description 改写,Empty 的默认描述随之变化 */}
      <ConfigProvider
        locale="en"
        messages={{ 'empty.description': 'No results — 已覆盖文案' }}
        style={{ ...box, background: 'var(--ms-color-bg-subtle)' }}
      >
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>
          messages 覆盖 empty.description + locale=&quot;en&quot;(根 lang=en)
        </small>
        <Empty />
      </ConfigProvider>
    </div>
  );
}
