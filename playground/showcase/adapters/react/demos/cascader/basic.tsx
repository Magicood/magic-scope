import type { CascaderOption } from '@magic-scope/react';
import { Cascader } from '@magic-scope/react';
import { useState } from 'react';

// 省 / 市 / 区三级树:hover 非叶子展开下一列,点叶子提交整条路径。
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
          { value: 'yuhang', label: '余杭' },
        ],
      },
      {
        value: 'ningbo',
        label: '宁波',
        children: [
          { value: 'haishu', label: '海曙' },
          { value: 'yinzhou', label: '鄞州' },
        ],
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
        children: [
          { value: 'xuanwu', label: '玄武' },
          { value: 'gulou', label: '鼓楼' },
        ],
      },
    ],
  },
];

export default function Demo() {
  const [path, setPath] = useState<string[]>([]);
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-2)', inlineSize: 'min(280px, 80vw)' }}>
      <Cascader options={options} value={path} onChange={setPath} aria-label="地区选择" />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        当前路径:{path.length ? path.join(' / ') : '未选择'}
      </small>
    </div>
  );
}
