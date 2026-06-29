import type { ToastOptions, ToastVariant } from '@magic-scope/react';
import { Button, toast } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

// 命令式组件:Toaster 容器已在应用根全局挂载,Playground 旋钮组装 toast() 调用参数,
// 点「弹出提示」即按当前旋钮弹出;变体快捷钮另作对照。
function Playground({ values }: { values: ControlValues }) {
  // 固定 id:旋钮弹出与「关闭」对应同一条,演示 toast.dismiss 主动关闭。
  const PLAYGROUND_ID = 'toast-playground';
  const fire = () => {
    const options: ToastOptions = {
      id: PLAYGROUND_ID,
      variant: values.variant as ToastVariant,
      duration: Number(values.duration),
    };
    if (values.withDescription) options.description = '可在「我的草稿」中随时取回。';
    if (values.withAction) {
      options.action = { label: '撤销', onClick: () => toast.success('已撤销') };
    }
    if (values.noIcon) options.icon = false;
    toast(values.message as string, options);
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button onClick={fire}>弹出提示</Button>
      <Button variant="outline" onClick={() => toast.success('设置已保存')}>
        成功
      </Button>
      <Button variant="outline" onClick={() => toast.error('提交失败,请重试')}>
        失败
      </Button>
      <Button variant="outline" onClick={() => toast.dismiss(PLAYGROUND_ID)}>
        关闭
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
