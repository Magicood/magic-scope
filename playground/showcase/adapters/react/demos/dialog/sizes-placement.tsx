import type { DialogPlacement, DialogSize } from '@magic-scope/react';
import { Button, Dialog } from '@magic-scope/react';
import { useState } from 'react';

// size(sm/md/lg/full)× placement(center/top)变体矩阵。
// full 铺满视口适合沉浸式编辑;top 贴顶让长表单滚动时位置更稳。
const SIZES: { size: DialogSize; label: string }[] = [
  { size: 'sm', label: '小' },
  { size: 'md', label: '中' },
  { size: 'lg', label: '大' },
  { size: 'full', label: '铺满' },
];

interface OpenState {
  size: DialogSize;
  placement: DialogPlacement;
}

export default function Demo() {
  const [state, setState] = useState<OpenState | null>(null);
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {(['center', 'top'] as DialogPlacement[]).map((placement) => (
        <div key={placement} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ width: '4.5rem', color: 'var(--ms-color-fg-muted)' }}>
            {placement === 'center' ? '居中' : '贴顶'}
          </span>
          {SIZES.map(({ size, label }) => (
            <Button
              key={size}
              variant="outline"
              size="sm"
              onClick={() => setState({ size, placement })}
            >
              {label}
            </Button>
          ))}
        </div>
      ))}
      <Dialog
        open={state !== null}
        size={state?.size}
        placement={state?.placement}
        onClose={() => setState(null)}
      >
        <Dialog.Header>
          <Dialog.Title>
            size={state?.size} · placement={state?.placement}
          </Dialog.Title>
          <Dialog.Description>
            尺寸决定面板宽度上限,placement 决定垂直锚点;full 会铺满整个视口。
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button onClick={() => setState(null)}>关闭</Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
}
