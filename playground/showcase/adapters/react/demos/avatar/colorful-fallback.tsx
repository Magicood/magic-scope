import { Avatar } from '@magic-scope/react';

// colorful:按 name 哈希给占位确定性配色(同名恒同色),关掉后全部落中性底。
// fallback:自定义占位内容(覆盖首字母),可传图标 / emoji 等任意 ReactNode。
const NAMES = ['Merlin', 'Morgana', 'Arthur', 'Guinevere'];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--ms-color-fg-muted)' }}>
          colorful 开(默认):同名恒同色的哈希配色
        </span>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {NAMES.map((n) => (
            <Avatar key={n} colorful name={n} />
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--ms-color-fg-muted)' }}>
          colorful 关:统一中性底,不再按名着色
        </span>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {NAMES.map((n) => (
            <Avatar key={n} colorful={false} name={n} />
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--ms-color-fg-muted)' }}>
          fallback:自定义占位(图标 / emoji)覆盖首字母
        </span>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Avatar name="访客" fallback={<span aria-hidden="true">👤</span>} />
          <Avatar tone="accent" name="机器人" fallback={<span aria-hidden="true">🤖</span>} />
          <Avatar
            tone="info"
            shape="square"
            name="团队"
            fallback={
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
                <title>用户组图标</title>
                <path
                  d="M12 12a4 4 0 100-8 4 4 0 000 8zm-8 8a8 8 0 0116 0"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}
