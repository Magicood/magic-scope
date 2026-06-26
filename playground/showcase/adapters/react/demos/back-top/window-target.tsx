import { BackTop } from '@magic-scope/react';

// 真实场景:不传 target,直接监听 window —— 这是长文档页最常见的用法。
// 浮钮固定贴在视口右下(本例 right/bottom=24,叠加安全区),
// 滚动整页超过 visibilityHeight 才淡入。把它放进任意长页面即可。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <p style={{ marginBlock: 0, color: 'var(--ms-color-fg)' }}>
        本例监听整页 window 滚动。向下滚动文档,视口右下角会淡入浮钮;点击平滑滚回页面顶部。
      </p>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        visibilityHeight=300:滚过 300px 才出现,避免短页面无谓闪现。
      </small>
      <BackTop visibilityHeight={300} />
    </div>
  );
}
