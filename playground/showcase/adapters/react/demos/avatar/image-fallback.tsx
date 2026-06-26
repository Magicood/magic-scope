import { Avatar } from '@magic-scope/react';

const SRC = 'https://i.pravatar.cc/120?img=13';

// 有 src 渲染图片;无 src 取 name 首字母(按空白切词,取首尾两词首字母,大写,最多 2 字)。
export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <Avatar src={SRC} name="Arthur Pendragon" />
      <Avatar name="Arthur Pendragon" />
      <Avatar name="Morgana" />
      <Avatar shape="square" name="Nimue Lake" />
    </div>
  );
}
