import { Button, Result } from '@magic-scope/react';

export default function Demo() {
  return (
    <Result
      status="success"
      size="lg"
      // icon 传 ReactNode 覆盖默认图标;children 作为补充内容区,extra 承载操作区。
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
      title="部署已完成"
      subtitle="新版本已上线,可邀请至多 6 名成员一同验收。"
      extra={
        <>
          <Button variant="solid">查看站点</Button>
          <Button variant="outline">复制链接</Button>
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
        <div>环境:生产 · 主区域</div>
        <div>构建耗时:42s</div>
        <div>缓存有效期:00:15:00</div>
      </div>
    </Result>
  );
}
