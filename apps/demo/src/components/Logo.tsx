interface LogoProps {
  size?: number;
  withWordmark?: boolean;
}

/** Vela 品牌标记:一枚收束的「帆 / 光圈」几何符号,克制、几何、无中二。 */
export function Logo({ size = 28, withWordmark = true }: LogoProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" role="img">
        <title>Vela</title>
        <defs>
          <linearGradient
            id="vela-mark"
            x1="4"
            y1="3"
            x2="28"
            y2="29"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--ms-color-primary)" />
            <stop offset="1" stopColor="var(--ms-color-accent)" />
          </linearGradient>
        </defs>
        <rect
          x="1.25"
          y="1.25"
          width="29.5"
          height="29.5"
          rx="8.5"
          stroke="var(--ms-color-border-strong)"
          strokeWidth="1.25"
        />
        <path
          d="M9 8.5L16 23.5L23 8.5"
          stroke="url(#vela-mark)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="11.5" r="1.6" fill="var(--ms-color-accent)" />
      </svg>
      {withWordmark && (
        <span
          style={{
            fontWeight: 'var(--ms-font-weight-semibold, 600)',
            fontSize: '1.075rem',
            letterSpacing: 'var(--ms-tracking-tight, -0.01em)',
            color: 'var(--ms-color-fg)',
          }}
        >
          Vela
        </span>
      )}
    </span>
  );
}
