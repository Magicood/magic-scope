import { Accordion } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 事件触发:multiple 受控(value 走 useState),每次回调把事件名+实参实时打印到列表。
// onExpandedChange 在 onValueChange 之前触发,故日志里靠下的那条更早(列表 newest-first)。
export default function Demo() {
  const [value, setValue] = useState<string[]>(['general']);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(440px, 100%)' }}>
      <Accordion
        type="multiple"
        value={value}
        items={[
          {
            value: 'general',
            title: '常见问题',
            content: '点击任意头部:观察下方实时打印的事件名与实参。',
          },
          {
            value: 'account',
            title: '账户与登录',
            content: 'onTriggerClick → onExpandedChange → onValueChange 依次触发。',
          },
          {
            value: 'billing',
            title: '计费与发票',
            content: 'multiple 受控:onValueChange 回 string[],需自行写回 value。',
          },
        ]}
        // 受控核心:onValueChange 回 string[](multiple),写回 state 才会真正展开/收起。
        onValueChange={(next) => {
          const arr = next as string[];
          setValue(arr);
          push(`onValueChange(value: [${arr.join(', ') || '空'}])`);
        }}
        // 被切换项 value + 切换后是否展开。
        onExpandedChange={(itemValue, open) => {
          push(`onExpandedChange(value: ${itemValue}, open: ${open})`);
        }}
        // 被点头部 value(在内部切换逻辑之前触发)。
        onTriggerClick={(itemValue) => {
          push(`onTriggerClick(value: ${itemValue})`);
        }}
      />

      <div style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前展开(受控 value):[{value.join(', ') || '空'}]
      </div>

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
