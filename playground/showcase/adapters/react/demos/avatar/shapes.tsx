import { Avatar } from '@magic-scope/react';

const SRC = 'https://i.pravatar.cc/120?img=13';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <Avatar shape="circle" src={SRC} name="圆形" />
      <Avatar shape="square" src={SRC} name="方形" />
    </div>
  );
}
