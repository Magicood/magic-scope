interface LogoProps {
  withWordmark?: boolean;
}

/** Daybreak 标记:地平线上初升的太阳,暖色、几何、克制。 */
export function Logo({ withWordmark = true }: LogoProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true" role="img">
        <title>Daybreak</title>
        <circle cx="16" cy="17" r="6.5" fill="var(--ms-color-primary)" />
        <g stroke="var(--ms-color-primary)" strokeWidth="1.8" strokeLinecap="round">
          <path d="M16 4.5v2.4" />
          <path d="M25.5 7.5l-1.7 1.7" />
          <path d="M6.5 7.5l1.7 1.7" />
        </g>
        <path d="M3 23h26" stroke="var(--ms-color-fg)" strokeWidth="1.8" strokeLinecap="round" />
        <path
          d="M8 27h16"
          stroke="var(--ms-color-border-strong)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      {withWordmark && (
        <span
          style={{
            fontFamily: 'var(--ms-font-display)',
            fontWeight: 'var(--ms-font-weight-semibold, 600)',
            fontSize: '1.2rem',
            letterSpacing: '0.01em',
            color: 'var(--ms-color-fg)',
          }}
        >
          Daybreak
        </span>
      )}
    </span>
  );
}
