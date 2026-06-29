import { Button } from '@magic-scope/react';

// 图标与加载态:前置 / 后置图标、纯图标(必配 aria-label)、loading(显示旋转图标、保持宽度、aria-busy)。
export default function Demo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
      <Button leftIcon={<span aria-hidden="true">✦</span>}>前置图标</Button>
      <Button rightIcon={<span aria-hidden="true">→</span>} variant="outline">
        后置图标
      </Button>
      <Button iconOnly aria-label="新建" variant="soft">
        <span aria-hidden="true">＋</span>
      </Button>
      <Button loading>保存中</Button>
      <Button loading variant="outline" tone="accent">
        加载数据
      </Button>
    </div>
  );
}
