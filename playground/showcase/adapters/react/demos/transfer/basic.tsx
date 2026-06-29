import type { TransferItem } from '@magic-scope/react';
import { Transfer } from '@magic-scope/react';

const dataSource: TransferItem[] = [
  { key: 'mira', title: 'Mira Chen 产品负责人' },
  { key: 'jonas', title: 'Jonas Park 前端工程师' },
  { key: 'ann', title: 'Ann Lee 后端工程师' },
  { key: 'leo', title: 'Leo Wang 设计师' },
  { key: 'sara', title: 'Sara Kim 测试工程师' },
];

export default function Demo() {
  // 非受控:用 defaultTargetKeys 给初始右栏,移动状态由组件内部自管,无需外部 useState。
  return (
    <Transfer
      dataSource={dataSource}
      defaultTargetKeys={['jonas']}
      titles={['可选成员', '项目成员']}
    />
  );
}
