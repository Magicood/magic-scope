import { VisuallyHidden } from '@magic-scope/react';

export default function Demo() {
  // 留口 as:换多态根标签。默认 span(行内);需要块级语义或落在特定标签里时改 div / h2 / label 等。
  // 视觉都隐身,差别在它在 DOM / 无障碍树里的语义角色。
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)' }}>
      <table style={{ borderCollapse: 'collapse', inlineSize: 'min(420px, 100%)' }}>
        <tbody>
          <tr>
            <td style={{ padding: 'var(--ms-space-2)', color: 'var(--ms-color-fg-muted)' }}>
              as=&quot;span&quot;
            </td>
            <td style={{ padding: 'var(--ms-space-2)' }}>
              行内默认 <VisuallyHidden>(隐藏 span)</VisuallyHidden>
            </td>
          </tr>
          <tr>
            <td style={{ padding: 'var(--ms-space-2)', color: 'var(--ms-color-fg-muted)' }}>
              as=&quot;div&quot;
            </td>
            <td style={{ padding: 'var(--ms-space-2)' }}>
              块级根 <VisuallyHidden as="div">(隐藏 div)</VisuallyHidden>
            </td>
          </tr>
          <tr>
            <td style={{ padding: 'var(--ms-space-2)', color: 'var(--ms-color-fg-muted)' }}>
              as=&quot;h2&quot;
            </td>
            <td style={{ padding: 'var(--ms-space-2)' }}>
              朗读标题 <VisuallyHidden as="h2">(隐藏 h2,SR 可导航)</VisuallyHidden>
            </td>
          </tr>
        </tbody>
      </table>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        三者视觉都隐身,但在无障碍树里分别是 span / div / heading,语义角色不同。
      </small>
    </div>
  );
}
