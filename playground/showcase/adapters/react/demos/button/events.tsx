import { Button } from '@magic-scope/react';
import { useRef, useState } from 'react';

export default function Demo() {
  const [count, setCount] = useState(0);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 5));

  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(420px, 100%)' }}>
      {/* 基础 onClick:点击计数,证明事件确实触发 */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <Button onClick={() => setCount((c) => c + 1)}>点我 +1</Button>
        <span style={{ color: 'var(--ms-color-fg-muted)' }}>onClick 已触发 {count} 次</span>
      </div>

      {/* loading / disabled:故意吞点击(下面不会有日志) */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button loading onClick={() => push('不该出现:loading 吞了点击')}>
          加载中
        </Button>
        <Button disabled onClick={() => push('不该出现:disabled 吞了点击')}>
          禁用
        </Button>
      </div>

      {/* asChild:渲染为 <a>,Button 与子元素的 onClick 都执行(事件 compose);
          子元素若 preventDefault 则会阻断 Button 的处理器(Radix 语义)。 */}
      <Button asChild onClick={() => push('Button 的 onClick ✦')}>
        <a href="#/button" onClick={() => push('子 <a> 的 onClick ✦')}>
          asChild 渲染为 &lt;a&gt; · 点我看两个 onClick 都触发
        </a>
      </Button>

      {log.length > 0 && (
        <ul
          style={{
            margin: 0,
            paddingInlineStart: '1.1rem',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.85rem',
          }}
        >
          {log.map((e) => (
            <li key={e.id}>{e.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
