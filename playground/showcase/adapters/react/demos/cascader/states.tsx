import type { CascaderOption } from '@magic-scope/react';
import { Cascader } from '@magic-scope/react';

// 状态矩阵:占位 / 禁用节点(既不可选也不可作为中转)/ 整体禁用 / 块级铺满。
const options: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [
          { value: 'xihu', label: '西湖' },
          { value: 'yuhang', label: '余杭(暂不开放)', disabled: true },
        ],
      },
      {
        value: 'wenzhou',
        label: '温州(整市维护中)',
        disabled: true,
        children: [{ value: 'lucheng', label: '鹿城' }],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      {
        value: 'nanjing',
        label: '南京',
        children: [{ value: 'xuanwu', label: '玄武' }],
      },
    ],
  },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', inlineSize: 'min(320px, 100%)' }}>
      <div
        style={{
          display: 'flex',
          gap: 'var(--ms-space-3)',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* 未选中:显示占位,展开后含禁用节点 */}
        <Cascader options={options} placeholder="挑一个地区…" aria-label="占位与禁用节点" />
        {/* 整体禁用 */}
        <Cascader
          options={options}
          defaultValue={['zhejiang', 'hangzhou', 'xihu']}
          disabled
          aria-label="整体禁用"
        />
      </div>
      {/* 块级铺满容器 */}
      <Cascader
        options={options}
        fullWidth
        placeholder="块级铺满(fullWidth)"
        aria-label="块级铺满"
      />
    </div>
  );
}
