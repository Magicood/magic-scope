import type { CascaderOption, CascaderSize, CascaderTone } from '@magic-scope/react';
import { Cascader } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

// 省 / 市 / 区三级:hover 任一非叶子即展开下一列,点叶子提交整条路径。
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
          { value: 'binjiang', label: '滨江' },
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
      {
        value: 'suzhou',
        label: '苏州(整市维护中)',
        disabled: true,
        children: [{ value: 'gusu', label: '姑苏' }],
      },
    ],
  },
];

function Playground({ values }: { values: ControlValues }) {
  const [path, setPath] = useState<string[]>(['zhejiang', 'hangzhou', 'xihu']);
  return (
    <Cascader
      options={options}
      value={path}
      onChange={setPath}
      size={values.size as CascaderSize}
      tone={values.tone as CascaderTone}
      changeOnSelect={values.changeOnSelect as boolean}
      fullWidth={values.fullWidth as boolean}
      disabled={values.disabled as boolean}
      placeholder={values.placeholder as string}
      aria-label="地区选择"
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/cascader/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/cascader/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'cascader',
  Playground,
  demos: buildDemos(comps, reactSources),
};
