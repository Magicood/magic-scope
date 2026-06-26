import { Button } from '@magic-scope/react';

// 形状 / 发光 / 块级:shape 三态(圆角 / 胶囊 / 直角)、glow 实例级发光强度、fullWidth 铺满容器。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem', maxInlineSize: 'min(28rem, 100%)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Button shape="default">圆角 default</Button>
        <Button shape="pill">胶囊 pill</Button>
        <Button shape="square">直角 square</Button>
        <Button shape="square" iconOnly aria-label="确认">
          <span aria-hidden="true">✓</span>
        </Button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Button glow="always">glow 常亮</Button>
        <Button glow="hover" variant="soft">
          glow 悬停
        </Button>
        <Button glow="off">glow 关闭</Button>
      </div>
      <Button fullWidth tone="accent">
        fullWidth 铺满容器
      </Button>
    </div>
  );
}
