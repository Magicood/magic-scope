import { alert, Button, confirm, prompt } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';

// 命令式组件:AlertDialogHost 已在应用根全局挂载,Playground 直接调用 confirm/alert/prompt。
// controls 为空,Playground 不消费 values,仅提供一组触发按钮并回显返回值做主交互演示。
function Playground() {
  const [result, setResult] = useState('(尚未触发,点上方按钮试试)');

  const handleConfirm = async () => {
    const ok = await confirm('确定要删除「奥术飞弹」吗?此操作不可撤销。', {
      title: '删除确认',
      variant: 'danger',
      confirmText: '删除',
      cancelText: '再想想',
    });
    setResult(ok ? 'confirm → 已确认删除' : 'confirm → 已取消');
  };

  const handleAlert = async () => {
    await alert('「奥术飞弹」已成功保存到奥术档案库。', {
      title: '操作完成',
      confirmText: '好的',
    });
    setResult('alert → 用户已知晓');
  };

  const handlePrompt = async () => {
    const name = await prompt('给这道法术起个名字:', {
      title: '命名法术',
      placeholder: '例如:奥术飞弹',
      defaultValue: '奥术飞弹',
    });
    setResult(name === null ? 'prompt → 已取消(返回 null)' : `prompt → 输入值:「${name}」`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'start' }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button variant="solid" onClick={handleConfirm}>
          危险确认 confirm
        </Button>
        <Button variant="outline" onClick={handleAlert}>
          提示 alert
        </Button>
        <Button variant="ghost" onClick={handlePrompt}>
          输入 prompt
        </Button>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: '0.85rem',
          color: 'var(--ms-color-fg-muted)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        返回值:{result}
      </p>
    </div>
  );
}

// 真实 demo 文件：同一文件既 import 渲染、又 ?raw 取源码（永不漂移）。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/alert-dialog/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/alert-dialog/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'alert-dialog',
  Playground,
  demos: buildDemos(comps, reactSources),
};
