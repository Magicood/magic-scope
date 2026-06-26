import { Avatar } from '@magic-scope/react';

// 对抗性内容:超长无空格用户名。
// Avatar 占位只取首字母(最多 2 字),固定尺寸的圆不会被撑破;
// 配套姓名标签用单行省略号收在边界内,不挤压头像、不裁焦点环。
const LONG_NAME =
  'Aurelianus·Maximilianus·Theophrastus·Bombastus·von·Hohenheim·Paracelsus·the·Grand·Arcanist';

function UserChip({ name }: { name: string }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.6rem',
        alignItems: 'center',
        inlineSize: 'min(280px, 100%)',
        padding: '0.5rem 0.75rem',
        border: '1px solid var(--ms-color-border)',
        borderRadius: 'var(--ms-radius-md)',
      }}
    >
      <Avatar name={name} />
      <span
        style={{
          minInlineSize: 0,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: 'var(--ms-color-fg)',
        }}
        title={name}
      >
        {name}
      </span>
    </div>
  );
}

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <UserChip name={LONG_NAME} />
      <UserChip name="Merlin Ambrosius" />
    </div>
  );
}
