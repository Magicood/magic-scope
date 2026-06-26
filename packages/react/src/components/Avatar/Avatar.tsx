import type {
  ComponentPropsWithoutRef,
  ImgHTMLAttributes,
  ReactElement,
  ReactNode,
  SyntheticEvent,
} from 'react';
import { cloneElement, forwardRef, isValidElement, useState } from 'react';
import { type MessageKey, useMessages } from '../../i18n';
import { type AvatarTone, getInitials, toneFromName } from './logic';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarShape = 'circle' | 'rounded' | 'square';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';
export type AvatarGlow = 'auto' | 'off' | 'hover' | 'always';
export type { AvatarTone };

/** status → 状态点的 tone 语义色映射。 */
const STATUS_TONE: Record<AvatarStatus, AvatarTone> = {
  online: 'success',
  offline: 'neutral',
  busy: 'danger',
  away: 'warning',
};

export interface AvatarProps extends ComponentPropsWithoutRef<'span'> {
  /** 尺寸预设(随 data-ms-density 缩放)。默认 md。传 number 时作为像素边长覆盖预设。 */
  size?: AvatarSize | number;
  /** 形状:圆形 / 中等圆角 / 直角。默认 circle。 */
  shape?: AvatarShape;
  /** 头像图片地址。提供且加载成功时渲染 <img>(object-fit:cover);失败回退占位。 */
  src?: string;
  /** 用户名。无 src/加载失败时取首字母占位;同时用于无障碍标签与确定性配色。 */
  name?: string;
  /** 语义色调,经全库 tone resolver 派生配色。默认随 colorful 由 name 哈希决定,否则 primary。 */
  tone?: AvatarTone;
  /** 按 name 哈希给占位确定性配色(同名同色)。默认 true;显式传 tone 时以 tone 为准。 */
  colorful?: boolean;
  /** 状态徽标:在右下角渲染状态点(online/offline/busy/away)。 */
  status?: AvatarStatus;
  /** 状态点呼吸脉冲(受 --ms-motion-scale 门控)。默认 false。 */
  statusPulse?: boolean;
  /** 描边光环(tone 发光环),用于强调当前用户 / 在线态。 */
  ring?: boolean;
  /** 是否带可见边框(占位态默认有柔边,图片态默认无)。 */
  bordered?: boolean;
  /** 发光强度(实例级,覆盖全局 fx):auto 仅占位态柔光 / off / hover 仅悬停 / always 常亮。默认 auto。 */
  glow?: AvatarGlow;
  /** 自定义占位内容(覆盖首字母):图标 / emoji 等任意 ReactNode。 */
  fallback?: ReactNode;
  /** 透传给内部 <img> 的原生属性(loading/decoding/srcSet/sizes/referrerPolicy 等)。 */
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
  /** 渲染为子元素(如 <a> / 路由 Link)并保留头像样式与内容(Radix Slot 风格)。 */
  asChild?: boolean;
}

/**
 * Avatar —— 头像(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 接全库统一 tone resolver(只读 6 槽位,零硬编码配色);name 哈希确定性配色;
 * img 加载失败自动回退首字母占位;状态点(online/away…)/ 光环 / 形状 / 实例级 glow;
 * 尺寸随密度 data-ms-density 缩放,size 可传 number;asChild 多态、fallback 槽位、imgProps 透传。
 * 配套 AvatarGroup(重叠堆叠 + 余量 +N)。样式见同目录 Avatar.css,需引入 @magic-scope/react/styles.css。
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      size = 'md',
      shape = 'circle',
      src,
      name,
      tone,
      colorful = true,
      status,
      statusPulse = false,
      ring = false,
      bordered,
      glow = 'auto',
      fallback,
      imgProps,
      asChild = false,
      className,
      style,
      onError,
      children,
      ...props
    },
    ref,
  ) => {
    const t = useMessages();
    const [imgError, setImgError] = useState(false);

    // src 缺失或加载失败 → 占位态
    const showImg = Boolean(src) && !imgError;
    const initials = name ? getInitials(name) : '';

    // tone 优先级:显式 tone > colorful 时 name 哈希 > primary
    const resolvedTone: AvatarTone = tone ?? (colorful ? toneFromName(name) : 'primary');

    // number 尺寸 → 内联 CSS 变量驱动(预设 token 经 calc 链生效);预设字号按边长比例派生
    const numericSize = typeof size === 'number' ? size : undefined;
    const sizeClass = numericSize === undefined ? `ms-avatar--${size}` : 'ms-avatar--custom';
    const numericStyle =
      numericSize === undefined
        ? undefined
        : ({
            '--ms-avatar-size': `${numericSize}px`,
            '--ms-avatar-font': `${Math.round(numericSize * 0.4)}px`,
          } as Record<string, string>);

    // 占位态默认带柔边,图片态默认无边(bordered 显式覆盖)
    const isBordered = bordered ?? !showImg;

    const classes = [
      'ms-avatar',
      sizeClass,
      `ms-avatar--${shape}`,
      `ms-tone-${resolvedTone}`,
      !showImg && 'ms-avatar--fallback',
      isBordered && 'ms-avatar--bordered',
      ring && 'ms-avatar--ring',
      glow !== 'auto' && `ms-avatar--glow-${glow}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const mergedStyle = numericStyle ? { ...numericStyle, ...style } : style;

    // 占位内容:自定义 fallback > 首字母 > 空
    const fallbackNode: ReactNode =
      fallback != null ? (
        <span className="ms-avatar__fallback" aria-hidden="true">
          {fallback}
        </span>
      ) : (
        <span className="ms-avatar__initials" aria-hidden="true">
          {initials}
        </span>
      );

    const statusNode =
      status != null ? (
        <span
          className={[
            'ms-avatar__status',
            `ms-avatar__status--${status}`,
            `ms-tone-${STATUS_TONE[status]}`,
            statusPulse && 'ms-avatar__status--pulse',
          ]
            .filter(Boolean)
            .join(' ')}
          role="status"
          aria-label={statusLabel(t, status)}
        />
      ) : null;

    // img onError:compose 用户传入的 onError,再做自身回退
    const handleImgError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
      imgProps?.onError?.(event);
      setImgError(true);
    };

    const inner = (
      <>
        {showImg ? (
          <img
            className="ms-avatar__img"
            {...imgProps}
            src={src}
            alt={imgProps?.alt ?? name ?? ''}
            onError={handleImgError}
          />
        ) : (
          fallbackNode
        )}
        {statusNode}
        {children}
      </>
    );

    // asChild:把样式与 props 合并到子元素(子元素自带内容),用于链接 / 路由 Link
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string; style?: object }>;
      return cloneElement(child, {
        ...props,
        ...(child.props as object),
        className: [classes, child.props.className].filter(Boolean).join(' '),
        style: { ...mergedStyle, ...child.props.style },
      });
    }

    // 图片态:语义由内层 <img alt> 承载,根 span 不再声明 role=img,避免双重 img 语义;
    // 占位态:根 span 带 role=img + aria-label,让占位也被读成一张图。用户可经 ...props 覆盖。
    const semanticProps = showImg
      ? {}
      : ({ role: 'img', 'aria-label': name } as { role: string; 'aria-label'?: string });

    return (
      <span
        ref={ref}
        className={classes}
        style={mergedStyle}
        {...semanticProps}
        onError={onError}
        {...props}
      >
        {inner}
      </span>
    );
  },
);
Avatar.displayName = 'Avatar';

/** 状态点的无障碍标签兜底中文(字典暂无 avatar.status.* key,见 notes)。 */
const STATUS_LABEL: Record<AvatarStatus, string> = {
  online: '在线',
  offline: '离线',
  busy: '忙碌',
  away: '离开',
};

/**
 * 状态点的无障碍标签:优先走字典 avatar.status.*(尚未登记,见 notes),缺失回退兜底中文。
 * key 暂不在 MessageKey 联合内,以 MessageKey 断言过渡;登记后 t 自动命中。
 */
function statusLabel(t: ReturnType<typeof useMessages>, status: AvatarStatus): string {
  return t(`avatar.status.${status}` as MessageKey, undefined, STATUS_LABEL[status]);
}

export type AvatarGroupSpacing = 'tight' | 'normal' | 'loose';

export interface AvatarGroupProps extends ComponentPropsWithoutRef<'div'> {
  /** 最多展示几个头像,超出收成 “+N” 占位。不传则全展示。 */
  max?: number;
  /** 重叠间距:tight 重叠多 / normal / loose 几乎不叠。默认 normal。 */
  spacing?: AvatarGroupSpacing;
  /** 统一下发给所有子 Avatar 与 “+N” 占位的尺寸。 */
  size?: AvatarSize | number;
  /** “+N” 占位的色调。默认 neutral。 */
  tone?: AvatarTone;
  /** 自定义余量渲染:接收溢出数量,返回节点(覆盖默认 “+N”)。 */
  renderOverflow?: (overflow: number) => ReactNode;
}

/**
 * AvatarGroup —— 头像组。重叠堆叠多个头像,超出 max 收成 “+N” 占位。
 * 给每个子 Avatar 注入统一 size 并打 ms-avatar-group__item(用于重叠负边距与描边)。
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      max,
      spacing = 'normal',
      size,
      tone = 'neutral',
      renderOverflow,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const items = flattenChildren(children);
    const limit = max != null && max > 0 ? max : items.length;
    const visible = items.slice(0, limit);
    const overflow = items.length - visible.length;

    return (
      // biome-ignore lint/a11y/useSemanticElements: 头像组是图像分组,role=group 承载语义
      <div
        ref={ref}
        role="group"
        className={['ms-avatar-group', `ms-avatar-group--${spacing}`, className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {visible.map((child, index) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: 头像组通常是静态、有序、不重排的展示列表
            key={index}
            className="ms-avatar-group__item"
          >
            {isValidElement(child) && size !== undefined
              ? cloneElement(child as ReactElement<{ size?: AvatarSize | number }>, { size })
              : child}
          </span>
        ))}
        {overflow > 0 && (
          <span className="ms-avatar-group__item">
            {renderOverflow ? (
              renderOverflow(overflow)
            ) : (
              <Avatar
                size={size ?? 'md'}
                tone={tone}
                colorful={false}
                className="ms-avatar-group__overflow"
                fallback={`+${overflow}`}
                aria-label={`+${overflow}`}
              />
            )}
          </span>
        )}
      </div>
    );
  },
);
AvatarGroup.displayName = 'AvatarGroup';

/** 把 children 摊平成数组并滤除空节点,供 AvatarGroup 计数与切片。 */
function flattenChildren(children: ReactNode): ReactNode[] {
  const out: ReactNode[] = [];
  const walk = (node: ReactNode) => {
    if (node == null || node === false || node === true) return;
    if (Array.isArray(node)) {
      for (const n of node) walk(n);
      return;
    }
    out.push(node);
  };
  walk(children);
  return out;
}
