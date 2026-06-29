import { Text } from '@magic-scope/react';

// 文字动效:五种入场/持续动画,受 data-ms-motion 与 prefers-reduced-motion 调制,
// 关闭时降级为静态(入场态直接呈现,不卡在隐藏)。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.8rem' }}>
      <Text as="div" size="3xl" weight="bold" animate="reveal" tone="primary">
        reveal 上浮淡入
      </Text>
      <Text as="div" size="3xl" weight="bold" animate="blur-in" tone="accent">
        blur-in 模糊聚焦
      </Text>
      <Text as="div" size="3xl" weight="bold" animate="shimmer" tone="info">
        shimmer 高光扫过
      </Text>
      <Text as="div" size="3xl" weight="bold" animate="pulse" tone="success">
        pulse 呼吸式发光
      </Text>
      <Text as="div" size="3xl" weight="bold" animate="flow" gradient="aurora">
        flow 渐变流动
      </Text>
    </div>
  );
}
