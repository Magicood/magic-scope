import { Link } from '@magic-scope/react';

export default function Demo() {
  return (
    <p style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', lineHeight: 2 }}>
      正文里嵌一条{' '}
      <Link href="#" underline="auto">
        auto 经典内联
      </Link>{' '}
      链接,静止有下划线、hover 去掉;也可以
      <Link href="#" underline="hover">
        hover 才出现
      </Link>
      、
      <Link href="#" underline="always">
        always 始终有
      </Link>
      ,或者
      <Link href="#" underline="none">
        none 从不
      </Link>
      。
    </p>
  );
}
