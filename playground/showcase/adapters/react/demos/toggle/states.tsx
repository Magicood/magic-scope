import { Toggle } from '@magic-scope/react';

// 状态矩阵:未按下 / 按下 / 禁用未按下 / 禁用已按下。
export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Toggle aria-label="未按下">未按下</Toggle>
      <Toggle defaultPressed aria-label="已按下">
        已按下
      </Toggle>
      <Toggle disabled aria-label="禁用且未按下">
        禁用
      </Toggle>
      <Toggle defaultPressed disabled aria-label="禁用且已按下">
        禁用·激活
      </Toggle>
    </div>
  );
}
