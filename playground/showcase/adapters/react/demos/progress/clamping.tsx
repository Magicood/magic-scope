import { Progress } from '@magic-scope/react';

/**
 * 边界对抗:喂入越界 / 非法 value,验证内部 clamp 把填充收在轨道内,永不溢出。
 * -40 与 NaN 回退到 0(空轨道),9999 夹到 100(填满),都不撑破容器。
 */
export default function Demo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', inlineSize: '100%' }}>
      <Progress value={-40} aria-label="负值越界" />
      <Progress value={Number.NaN} aria-label="非法值" />
      <Progress value={9999} aria-label="超大越界" />
    </div>
  );
}
