import { Link } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', alignItems: 'center' }}>
      <Link href="#" underline="always">
        默认链接色
      </Link>
      <Link href="#" tone="accent" underline="always">
        accent
      </Link>
      <Link href="#" tone="success" underline="always">
        success
      </Link>
      <Link href="#" tone="warning" underline="always">
        warning
      </Link>
      <Link href="#" tone="danger" underline="always">
        danger
      </Link>
      <Link href="#" tone="info" underline="always">
        info
      </Link>
      <Link href="#" tone="neutral" underline="always">
        neutral
      </Link>
      <Link href="#" muted>
        muted 次级
      </Link>
    </div>
  );
}
