import type { MenuItem } from '@magic-scope/react';
import { Button, Menu } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 事件触发实时回显:绑定 onOpenChange / 菜单级 onSelect / 项级 item.onSelect,
// 每次触发把「事件名 + 实参」打到日志列表,直接验证触发时机与参数。
export default function Demo() {
  // 受控开合:open 既驱动菜单,又实时回显在面板上。
  const [open, setOpen] = useState(false);
  // 上次选中项,受控回显(菜单级 onSelect 写入)。
  const [picked, setPicked] = useState('(尚未选择)');
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  const items: MenuItem[] = [
    {
      label: '重命名 ✎',
      // 项级 onSelect():无参,先于菜单级 onSelect 触发。
      onSelect: () => push('item.onSelect() → 重命名'),
    },
    {
      label: '复制链接 ⧉',
      onSelect: () => push('item.onSelect() → 复制链接'),
    },
    {
      label: '删除 ✕',
      danger: true,
      onSelect: () => push('item.onSelect() → 删除'),
    },
  ];

  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(420px, 100%)' }}>
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
      >
        <Menu
          trigger={<Button variant="outline">操作 ▾(受控)</Button>}
          items={items}
          // 受控开合:点 trigger / 点外 / Esc / 选中都会经此回调。
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            push(`onOpenChange(${next})`);
          }}
          // 菜单级:任一项被选中都触发,带 (item, index)。
          onSelect={(item, index) => {
            const label = typeof item.label === 'string' ? item.label : '(非文本项)';
            setPicked(label);
            push(`onSelect(item="${label}", index=${index})`);
          }}
          // Esc 关闭前回调(此处不拦截,仅证明触发)。
          onEscapeKeyDown={() => push('onEscapeKeyDown(Esc)')}
        />
        <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.875rem' }}>
          open:{String(open)} · 上次选择:{picked}
        </p>
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
