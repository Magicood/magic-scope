import { Button, Dialog } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 事件触发实时回显:绑定 Dialog 的关键回调,每次触发把「事件名 + 实参」打印到列表,
// 让你看到到底触发了什么、参数是什么。open 受控;Esc 拦截开关演示 onEscapeKeyDown
// 在原生事件上 preventDefault 即可拦截关闭(命令式确认类场景)。
export default function Demo() {
  const [open, setOpen] = useState(false);
  const [lockEsc, setLockEsc] = useState(false);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 8));

  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(460px, 100%)' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <Button onClick={() => setOpen(true)}>打开对话框</Button>
        <label
          style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.85rem' }}
        >
          <input type="checkbox" checked={lockEsc} onChange={(e) => setLockEsc(e.target.checked)} />
          锁定 Esc(拦截关闭)
        </label>
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
          当前 open:{String(open)}
        </span>
      </div>

      <Dialog
        open={open}
        tone="info"
        onOpenChange={(next) => {
          push(`onOpenChange(open: ${next})`);
          setOpen(next);
        }}
        onClose={() => push('onClose()')}
        onEscapeKeyDown={(event) => {
          if (lockEsc) {
            event.preventDefault();
            push('onEscapeKeyDown(Escape) → preventDefault 已拦截关闭');
          } else {
            push('onEscapeKeyDown(Escape)');
          }
        }}
        onPointerDownOutside={() => push('onPointerDownOutside(点击遮罩)')}
        onInteractOutside={() => push('onInteractOutside(外部交互)')}
      >
        <Dialog.Header>
          <Dialog.Title>事件回显</Dialog.Title>
          <Dialog.Description>
            按 Esc、点遮罩、点关闭按钮或下面的按钮关闭,右下方列表会实时记录触发的事件与实参。
            {lockEsc ? '当前已锁定 Esc:按 Esc 不会关闭。' : ''}
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            关闭(按钮)
          </Button>
        </Dialog.Footer>
      </Dialog>

      <ul
        style={{
          margin: 0,
          paddingInlineStart: '1.1rem',
          color: 'var(--ms-color-fg-muted)',
          fontSize: '0.85rem',
          minBlockSize: '1.4rem',
        }}
      >
        {log.length === 0 ? (
          <li style={{ listStyle: 'none', marginInlineStart: '-1.1rem' }}>
            还没有事件,打开对话框再关闭试试。
          </li>
        ) : (
          log.map((e) => <li key={e.id}>{e.text}</li>)
        )}
      </ul>
    </div>
  );
}
