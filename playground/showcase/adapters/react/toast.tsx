import { Button, toast } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';

// 命令式组件:Toaster 容器已在应用根全局挂载,demo 直接调用 toast()。
// controls 为空,Playground 不消费 values,仅提供一组触发按钮做主交互演示。
function Playground() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button onClick={() => toast('施法已记录 ✦')}>弹出提示</Button>
      <Button variant="outline" onClick={() => toast.success('传送门已开启')}>
        成功
      </Button>
      <Button variant="outline" onClick={() => toast.error('咒语反噬,施法失败')}>
        失败
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast('已将传送门移除', {
            action: { label: '撤销', onClick: () => toast.success('传送门已恢复') },
          })
        }
      >
        带撤销
      </Button>
    </div>
  );
}

// 真实 demo 文件：同一文件既 import 渲染、又 ?raw 取源码（永不漂移）。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/toast/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/toast/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'toast',
  Playground,
  demos: buildDemos(comps, reactSources),
};
