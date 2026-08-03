import { Button, Toaster, toast } from '@magic-scope/react';

// Toaster 容器的配置:position 弹出位置、max 同屏活跃上限、expand 堆叠展开。
// (应用根已全局挂载一个默认 Toaster;这里再放一个配置过的容器演示这些开关。)
export default function Demo() {
  let seq = 0;
  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <Toaster position="top-center" max={3} expand />
      <Button
        onClick={() => {
          seq += 1;
          toast(`第 ${seq} 条通知(顶部居中 · 最多 3 条)`);
        }}
      >
        连续弹出(超出 max 时最旧的退场)
      </Button>
    </div>
  );
}
