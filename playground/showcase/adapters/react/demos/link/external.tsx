import { Link } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', alignItems: 'center' }}>
      <Link href="https://example.com" external>
        外链自动安全化
      </Link>
      <Link href="https://example.com" external hideExternalIcon>
        隐藏外链图标
      </Link>
      <Link href="https://example.com" external externalIcon="↗" tone="accent">
        自定义图标
      </Link>
    </div>
  );
}
