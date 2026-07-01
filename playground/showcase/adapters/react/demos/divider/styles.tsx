import { Divider } from '@magic-scope/react';

// 线型 variant × 色调 tone × 线粗 thickness × 主轴间距 spacing 组合:
// 分节标题下的强调线、次要虚线、点线等。
export default function Demo() {
  return (
    <div style={{ display: 'grid' }}>
      <Divider
        variant="solid"
        tone="primary"
        thickness="regular"
        spacing="sm"
        label="solid · primary"
      />
      <Divider variant="dashed" tone="info" thickness="thin" spacing="md" label="dashed · info" />
      <Divider
        variant="dotted"
        tone="accent"
        thickness="bold"
        spacing="sm"
        label="dotted · accent"
      />
    </div>
  );
}
