/* ============================================================================
 * Daybreak 高级编辑式调色板(消费方自定义,覆盖在 applyTheme 之上)。
 * 取向:暖纸白底 + espresso ink 文字 + 克制陶土/金强调,深色 ink 作主 CTA。
 * 对标 Aesop / Everlane / Onyx 的精品零售质感,去亮黄、去重边框。
 * ========================================================================== */

/** 语义角色 → 精挑色值(库不锁色彩,这里按品牌配置)。 */
const PALETTE: Record<string, string> = {
  bg: '#F4EEE3',
  surface: '#FBF6EE',
  'surface-raised': '#FFFFFF',
  'surface-sunken': '#ECE3D4',
  'surface-hover': '#F0E8DA',
  'surface-overlay': '#FBF6EE',
  overlay: 'rgba(28, 21, 15, 0.46)',

  fg: '#211A12',
  'fg-muted': '#6A5D4E',
  'fg-subtle': '#A2917C',

  border: '#E6DBC8',
  'border-strong': '#D3C3A9',

  primary: '#23190F',
  'primary-hover': '#352718',
  'primary-active': '#160F08',
  'on-primary': '#F6EFE2',

  accent: '#B25733',
  'on-accent': '#FFF4EC',

  success: '#5E7A50',
  'on-success': '#F4F7EF',
  warning: '#BE883A',
  'on-warning': '#241A0E',
  danger: '#AE5236',
  'on-danger': '#FFF2EC',
  info: '#5A6E7A',
  'on-info': '#F0F4F6',

  link: '#B25733',
  'link-hover': '#8F421F',
  selection: '#E7D6BC',
  'on-selection': '#211A12',
  'focus-ring': '#B25733',
  glow: 'rgba(178, 87, 51, 0.4)',
};

/** 在 applyTheme 之后调用:用品牌色覆盖语义角色(inline 写法,与 applyTheme 一致、后者优先)。 */
export function applyBrandPalette(target: HTMLElement = document.documentElement): void {
  for (const [role, value] of Object.entries(PALETTE)) {
    target.style.setProperty(`--ms-color-${role}`, value);
  }
}
