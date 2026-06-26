import { VisuallyHidden } from '@magic-scope/react';

export default function Demo() {
  // asChild:不额外包一层 DOM,把 sr-only 类 / props / ref 合并到唯一子元素(Radix Slot 模式)。
  // 适合包裹自带交互的元素(路由 Link、原生 <a>):事件 compose、ref 合并、className 与子元素已有类拼接。
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)' }}>
      <p style={{ margin: 0, color: 'var(--ms-color-fg)' }}>
        正文中嵌一个对视觉隐藏、却仍可被 SR 朗读并可点击的链接 ——
        <VisuallyHidden asChild>
          <a href="#ms-vh-aschild-note" style={{ color: 'var(--ms-color-accent, #6d4aff)' }}>
            (隐藏但可达的脚注链接)
          </a>
        </VisuallyHidden>
        视觉上看不到,DOM 也没多包一层 span。
      </p>
      <small id="ms-vh-aschild-note" style={{ color: 'var(--ms-color-fg-muted)' }}>
        asChild 把 .ms-visually-hidden 直接挂到 &lt;a&gt; 上,子元素自身的 href / 样式 / 事件都保留。
      </small>
    </div>
  );
}
