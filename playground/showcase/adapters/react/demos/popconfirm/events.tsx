import { Button, Popconfirm } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 事件触发实时面板:绑定 onConfirm / onCancel / onOpenChange,
// 每次触发把「事件名 + 实参」打到列表,受控 open 回显当前状态。
// onConfirm 返回 Promise 演示命令式异步确认(确认按钮自动 loading,resolve 才关闭)。
export default function Demo() {
  // 受控:open 由外部 state 驱动,事件回显当前显隐态
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  // 命令式异步确认:0.8s 后 resolve,Popconfirm 自动收尾(loading→关闭)
  const confirmAsync = () =>
    new Promise<void>((resolve) => {
      setPending(true);
      setTimeout(() => {
        setPending(false);
        push('onConfirm() · 异步 resolve,自动关闭');
        resolve();
      }, 800);
    });

  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(440px, 100%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Popconfirm
          trigger={<Button>提交施法</Button>}
          title="确定提交?"
          description="确认走异步流程,resolve 后自动关闭。"
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            push(`onOpenChange(${next}) · ${next ? '弹出' : '关闭'}`);
          }}
          onConfirm={confirmAsync}
          onCancel={() => push('onCancel() · 取消 / 点外 / Esc 关闭')}
        />
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
          当前 open:{String(open)}
          {pending ? ' · 确认中…' : ''}
        </span>
      </div>

      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.8rem' }}>
        点确认走异步、点取消 / 点浮层外 / 按 Esc 都会触发对应事件,下方实时打印事件名与实参。
      </p>

      {log.length > 0 ? (
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
      ) : (
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
          尚无事件,点上方按钮试试。
        </span>
      )}
    </div>
  );
}
