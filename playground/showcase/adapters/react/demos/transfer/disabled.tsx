import type { TransferItem } from '@magic-scope/react';
import { Transfer } from '@magic-scope/react';
import { useState } from 'react';

// 两个层级的禁用:
// 1) 单项 disabled —— 该项不可选、不参与全选、不可移动(如锁定的系统角色)。
// 2) 组件级 disabled —— 整体只读,两栏不可选、方向按钮不可用。
const dataSource: TransferItem[] = [
  { key: 'viewer', title: '访客 viewer' },
  { key: 'editor', title: '编辑 editor' },
  { key: 'admin', title: '管理员 admin' },
  { key: 'owner', title: '所有者 owner(锁定)', disabled: true },
  { key: 'system', title: '系统账户 system(锁定)', disabled: true },
];

export default function Demo() {
  const [targetKeys, setTargetKeys] = useState<string[]>(['owner', 'editor']);
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--ms-space-5, 1.5rem)',
      }}
    >
      <div>
        <p
          style={{
            margin: '0 0 var(--ms-space-2, 0.5rem)',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.85rem',
          }}
        >
          单项禁用:owner / system 锁定不可移动
        </p>
        <Transfer
          dataSource={dataSource}
          targetKeys={targetKeys}
          onChange={setTargetKeys}
          titles={['可分配角色', '已授予']}
        />
      </div>
      <div>
        <p
          style={{
            margin: '0 0 var(--ms-space-2, 0.5rem)',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.85rem',
          }}
        >
          组件级禁用:整体只读
        </p>
        <Transfer
          dataSource={dataSource}
          defaultTargetKeys={['editor']}
          disabled
          titles={['可分配角色', '已授予']}
        />
      </div>
    </div>
  );
}
