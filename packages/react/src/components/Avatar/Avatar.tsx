import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarShape = 'circle' | 'square';

export interface AvatarProps extends ComponentPropsWithoutRef<'span'> {
  /** 尺寸。默认 md。 */
  size?: AvatarSize;
  /** 形状:圆形 / 方形。默认 circle。 */
  shape?: AvatarShape;
  /** 头像图片地址。提供时渲染 <img>,object-fit:cover 填充。 */
  src?: string;
  /** 用户名。无 src 时取首字母(大写,最多 2 字)作为占位;同时用于无障碍标签。 */
  name?: string;
}

/** 取 name 的首字母作占位:按空白切词,取首尾两词首字母,大写,最多 2 字。 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase().slice(0, 2);
}

/**
 * Avatar —— 头像,展示用户图片或姓名首字母占位。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 有 src 渲染 <img>(object-fit:cover);无 src 时取 name 首字母居中,占位底色用 primary 25% 与 surface 混色、文字 primary。
 * 圆形走 radius-full,方形走 radius-md。样式见同目录 Avatar.css,需引入 @magic-scope/react/styles.css。
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ size = 'md', shape = 'circle', src, name, className, ...props }, ref) => {
    const initials = name ? getInitials(name) : '';
    return (
      <span
        ref={ref}
        className={[
          'ms-avatar',
          `ms-avatar--${size}`,
          `ms-avatar--${shape}`,
          !src ? 'ms-avatar--fallback' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        role="img"
        aria-label={name}
        {...props}
      >
        {src ? (
          <img className="ms-avatar__img" src={src} alt={name ?? ''} />
        ) : (
          <span className="ms-avatar__initials" aria-hidden="true">
            {initials}
          </span>
        )}
      </span>
    );
  },
);
Avatar.displayName = 'Avatar';
