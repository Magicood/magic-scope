import { Progress } from '@magic-scope/react';

/**
 * 环形变体(variant="circular",SVG stroke-dashoffset 驱动进度弧):
 *  - showValue 把百分比渲染在环心,确定态可读;label 槽位可放任意 ReactNode 覆盖纯百分比。
 *  - glow="off" 关闭实例级装饰发光(覆盖全局 --ms-fx-glow),对比默认发光环。
 *  - 不确定态:环形持续旋转。
 */
export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ inlineSize: '6rem' }}>
        <Progress variant="circular" value={66} showValue aria-label="环形 66%" />
      </div>

      <div style={{ inlineSize: '6rem' }}>
        <Progress
          variant="circular"
          value={100}
          tone="success"
          label={<span aria-hidden="true">✓</span>}
          aria-label="已完成"
        />
      </div>

      <div style={{ inlineSize: '6rem' }}>
        <Progress
          variant="circular"
          value={48}
          tone="accent"
          glow="off"
          showValue
          aria-label="无发光 48%"
        />
      </div>

      <div style={{ inlineSize: '6rem' }}>
        <Progress variant="circular" indeterminate tone="info" aria-label="加载中" />
      </div>
    </div>
  );
}
