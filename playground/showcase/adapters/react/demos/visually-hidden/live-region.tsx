import { VisuallyHidden } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  // 进阶:把 VisuallyHidden 当「无障碍播报区」—— 配合 aria-live,
  // 动态变化(加入购物车、复制成功、表单校验)无需视觉提示,也能即时朗读给 SR 用户。
  // 文案变化时,role="status" + aria-live 让 SR 自动读出新内容;视觉端用旁边的可见提示对照。
  const [count, setCount] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const [visibleHint, setVisibleHint] = useState('购物车为空');

  const addToCart = () => {
    const next = count + 1;
    setCount(next);
    setAnnouncement(`已加入购物车,共 ${next} 件商品`);
    setVisibleHint(`购物车:${next} 件`);
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-4)', inlineSize: 'min(360px, 100%)' }}>
      {/* 隐藏的 live region:仅 SR 朗读,视觉不可见 */}
      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>

      <button
        type="button"
        onClick={addToCart}
        style={{
          justifySelf: 'start',
          padding: 'var(--ms-space-2) var(--ms-space-4)',
          borderRadius: 'var(--ms-radius-md)',
          border: '1px solid var(--ms-color-accent, #6d4aff)',
          background: 'var(--ms-color-accent, #6d4aff)',
          color: 'var(--ms-color-accent-fg, #fff)',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        🛒 加入购物车
      </button>

      <div
        style={{
          display: 'flex',
          gap: 'var(--ms-space-2)',
          alignItems: 'center',
          padding: 'var(--ms-space-3)',
          borderRadius: 'var(--ms-radius-md)',
          border: '1px dashed var(--ms-color-border)',
          background: 'var(--ms-color-bg)',
        }}
      >
        <span style={{ color: 'var(--ms-color-fg)' }}>{visibleHint}</span>
      </div>

      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        每次点击,隐藏的 aria-live 区会朗读
        {announcement ? `「${announcement}」` : '最新状态'},SR 用户无需看屏也能即时获知。
      </small>
    </div>
  );
}
