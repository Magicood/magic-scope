import { Button, Result } from '@magic-scope/react';

export default function Demo() {
  return (
    <Result
      status="success"
      size="lg"
      // icon 传 ReactNode 覆盖默认符文;children 作为补充内容区,extra 承载操作区。
      icon={
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" aria-hidden="true">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      title="传送门已开启"
      subtitle="目的地坐标已校验,可携带至多 6 名同伴一同穿越。"
      extra={
        <>
          <Button variant="solid">立即穿越</Button>
          <Button variant="outline">复制坐标</Button>
          <Button variant="ghost">取消</Button>
        </>
      }
      style={{ maxInlineSize: 'min(34rem, 100%)' }}
    >
      <div
        style={{
          display: 'grid',
          gap: '0.35rem',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          background: 'color-mix(in srgb, currentColor 6%, transparent)',
          fontSize: '0.85rem',
          textAlign: 'start',
        }}
      >
        <div>目的地:第七秘境 · 星界回廊</div>
        <div>耗费法力:42 / 120</div>
        <div>有效时长:00:15:00</div>
      </div>
    </Result>
  );
}
