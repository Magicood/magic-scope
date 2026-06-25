import { Kbd } from '@magic-scope/react';

export default function Demo() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.75rem',
        inlineSize: 'min(280px, 100%)',
      }}
    >
      <Kbd
        style={{
          maxInlineSize: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        SuperLongShortcutNameWithoutAnySpaceShouldStayInsideTheCap
      </Kbd>
      <Kbd>正常组合键</Kbd>
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.8rem' }}>
        超长无空格串被省略号收在键帽内,不撑破容器、不裁切焦点环。
      </span>
    </div>
  );
}
