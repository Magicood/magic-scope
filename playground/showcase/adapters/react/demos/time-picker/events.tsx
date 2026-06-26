import type { TimeParts } from '@magic-scope/react';
import { TimePicker } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 事件演示:onChange 回 "HH:mm:ss" 字符串 + 拆好的 TimeParts(选列 / 点「此刻」/ 清除时触发);
// onOpenChange 回开合状态(点 trigger / 点外 / Esc / 确定)。受控开合也接在这里。
export default function Demo() {
  const [value, setValue] = useState<string | null>('07:20:00');
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  const fmtParts = (p: TimeParts | null) => (p ? `{h:${p.h}, m:${p.m}, s:${p.s}}` : 'null');

  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.6rem)', inlineSize: 'min(360px, 100%)' }}
    >
      <TimePicker
        value={value}
        open={open}
        clearable
        onChange={(v, parts) => {
          setValue(v);
          push(`onChange("${v ?? 'null'}", parts=${fmtParts(parts)})`);
        }}
        onOpenChange={(next) => {
          setOpen(next);
          push(`onOpenChange(${next})`);
        }}
        aria-label="事件演示"
      />
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前值:{value ?? '(空)'} ｜ 浮层:{open ? '展开' : '收起'}
      </span>
      {log.length > 0 && (
        <ul
          style={{
            margin: 0,
            paddingInlineStart: '1.1rem',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.82rem',
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
