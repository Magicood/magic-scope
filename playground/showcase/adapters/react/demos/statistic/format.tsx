import { Statistic } from '@magic-scope/react';

// 数值格式化:千分位插入 + precision 小数位 + 拆 sign/integer/fraction 三段分字号。
// number 与数字串都会被解析;groupSeparator 可换分隔符或传空串关闭分组;非数字串原样透传。
export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--ms-space-5, 1.25rem)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      }}
    >
      <Statistic title="千分位(默认 ,)" value={1234567.89} precision={2} prefix="¥" />
      <Statistic title="空格分隔" value={1234567.89} precision={2} groupSeparator=" " prefix="¥" />
      <Statistic title="关闭分组" value={1234567} groupSeparator="" />
      <Statistic title="数字串解析" value="98765.4321" precision={2} suffix="ms" />
      <Statistic title="负数染负号" value={-3201.5} precision={1} prefix="¥" />
      <Statistic title="非数字原样透传" value="——" />
    </div>
  );
}
