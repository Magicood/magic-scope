import type { ComponentPropsWithoutRef, ElementType, ReactElement, ReactNode, Ref } from 'react';
import { cloneElement, forwardRef, isValidElement } from 'react';
import { useMessages } from '../../i18n';
import { composeRefs, mergeAsChildProps } from '../../utils/compose';
import {
  isHttpStatus,
  type ResultSize,
  type ResultStatus,
  type ResultTone,
  resolveDefaultTitleKey,
  resolveGlyph,
  resolveTone,
} from './logic';

export type { ResultSize, ResultStatus, ResultTone };

/** 各部件的细粒度 className,便于深度定制而不丢内部布局。 */
export interface ResultClassNames {
  /** 根容器。 */
  root?: string;
  /** 图标区(柔底圆 + 字符/SVG)。 */
  icon?: string;
  /** 标题行。 */
  title?: string;
  /** 副标题行。 */
  subtitle?: string;
  /** 补充内容区(children)。 */
  content?: string;
  /** 操作区(extra)。 */
  extra?: string;
}

export interface ResultProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  /**
   * 结果状态:语义结果(success / error / info / warning)+ HTTP 异常(404 / 403 / 500)。
   * 决定默认图标、默认 tone 配色,HTTP 异常另给默认标题。默认 info。
   */
  status?: ResultStatus;
  /**
   * 语义色调,覆盖 status 派生的默认 tone。经全库统一 tone resolver 派生配色(只读 6 槽位)。
   * 不传时按 status 自动联动(success→success、error→danger、404→info …)。
   */
  tone?: ResultTone;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: ResultSize;
  /**
   * 图标:不传按 status 给默认图标/数字码;传 ReactNode 覆盖(可放 SVG);传 false 关闭整个图标区。
   */
  icon?: ReactNode | false;
  /** 主标题。HTTP 异常不传时给默认标题(如 404→“页面不存在”)。 */
  title?: ReactNode;
  /** 副标题(标题下方的说明文字)。 */
  subtitle?: ReactNode;
  /** 操作区:返回 / 重试等按钮,渲染在内容最下方。 */
  extra?: ReactNode;
  /** 各部件细粒度 className。 */
  classNames?: ResultClassNames;
  /** 多态:改变根元素标签(如 'section' / 'main')。默认 'div'。与 asChild 互斥。 */
  as?: ElementType;
  /**
   * 渲染为子元素(把样式 / props 合并到子元素,Radix Slot 风格;由子元素自带内容)。
   * 与子部件槽位互斥(此模式下不渲染内部图标/标题等结构)。
   */
  asChild?: boolean;
}

/**
 * Result —— 结果页(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * status 七态(success / error / info / warning / 404 / 403 / 500)派生默认图标与 tone 配色,
 * tone 可显式覆盖;图标用大号字符/SVG + tone 柔底发光圆;title / subtitle / extra / children 四槽位,
 * 各带 classNames 细粒度定制;size 随密度缩放;多态 as 改根标签、asChild 合并到子元素。
 * 纯映射逻辑见同目录 logic.ts。样式见 Result.css,需引入 @magic-scope/react/styles.css。
 */
export const Result = forwardRef<HTMLDivElement, ResultProps>(
  (
    {
      status = 'info',
      tone,
      size = 'md',
      icon,
      title,
      subtitle,
      extra,
      classNames,
      as,
      asChild = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const resolvedTone = tone ?? resolveTone(status);
    const httpCode = isHttpStatus(status);

    const t = useMessages();
    const classes = [
      'ms-result',
      `ms-result--${size}`,
      `ms-result--status-${status}`,
      `ms-tone-${resolvedTone}`,
      className,
      classNames?.root,
    ]
      .filter(Boolean)
      .join(' ');

    // asChild:把样式与 props 合并到子元素(子元素自带内容);内部结构槽位在此模式下不生效。
    // 事件 compose(子元素与 Result 同名处理器都执行)、ref 合并到子元素。
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childRef = (child as { ref?: Ref<unknown> }).ref;
      const merged = mergeAsChildProps({ ...props, className: classes }, child.props);
      return cloneElement(child, {
        ...merged,
        ref: composeRefs(ref as Ref<unknown>, childRef),
      } as Record<string, unknown>);
    }

    // 图标:false 关闭整区;未传按 status 给默认图标/数字码;传 ReactNode 覆盖。
    const showIcon = icon !== false;
    const iconNode = icon === false ? null : (icon ?? resolveGlyph(status));

    // 标题:未传且为 HTTP 异常时给默认标题兜底。
    const titleKey = httpCode ? resolveDefaultTitleKey(status) : undefined;
    const resolvedTitle = title ?? (titleKey ? t(titleKey) : undefined);

    const Root = (as ?? 'div') as ElementType;

    return (
      <Root ref={ref} className={classes} {...props}>
        {showIcon && (
          <div
            className={['ms-result__icon', httpCode && 'ms-result__icon--code', classNames?.icon]
              .filter(Boolean)
              .join(' ')}
            aria-hidden="true"
          >
            <span className="ms-result__glyph">{iconNode}</span>
          </div>
        )}
        {resolvedTitle != null && (
          <div className={['ms-result__title', classNames?.title].filter(Boolean).join(' ')}>
            {resolvedTitle}
          </div>
        )}
        {subtitle != null && (
          <div className={['ms-result__subtitle', classNames?.subtitle].filter(Boolean).join(' ')}>
            {subtitle}
          </div>
        )}
        {children != null && (
          <div className={['ms-result__content', classNames?.content].filter(Boolean).join(' ')}>
            {children}
          </div>
        )}
        {extra != null && (
          <div className={['ms-result__extra', classNames?.extra].filter(Boolean).join(' ')}>
            {extra}
          </div>
        )}
      </Root>
    );
  },
);
Result.displayName = 'Result';
