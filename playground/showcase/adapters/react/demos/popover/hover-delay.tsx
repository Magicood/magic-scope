import { Button, Popover } from '@magic-scope/react';

// hover 触发 + 延时:triggerAction=hover;openDelay 让快速划过不弹出,
// closeDelay 留余量让指针能安全移动到浮层内再关闭。
export default function Demo() {
  return (
    <Popover
      triggerAction="hover"
      openDelay={120}
      closeDelay={200}
      trigger={<Button variant="outline">悬停查看(带延时)</Button>}
    >
      <p
        style={{
          margin: 0,
          padding: '0.4rem 0.6rem',
          maxInlineSize: '16rem',
          color: 'var(--ms-color-fg-muted)',
        }}
      >
        openDelay 防误触,closeDelay 防止移到浮层途中误关 —— hover 浮层的两个关键手感参数。
      </p>
    </Popover>
  );
}
