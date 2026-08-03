import { Link } from '@magic-scope/react';

// leftIcon:文字前的装饰图标(随链接色,aria-hidden)。
export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      <Link href="#docs" leftIcon={<span aria-hidden="true">📄</span>}>
        查看文档
      </Link>
      <Link href="#download" tone="accent" leftIcon={<span aria-hidden="true">↓</span>}>
        下载安装包
      </Link>
    </div>
  );
}
