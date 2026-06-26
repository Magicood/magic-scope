import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { type LabelSize, type LabelTone, resolveLabelClasses, resolveMark } from './logic';

export type { LabelSize, LabelTone } from './logic';

export interface LabelProps extends ComponentPropsWithoutRef<'label'> {
  /** 标签文字内容。 */
  children?: ReactNode;
  /** 尺寸(随 data-ms-density 缩放),与表单控件三档对齐。默认 md。 */
  size?: LabelSize;
  /**
   * 语义色调:根加 `ms-tone-${tone}`,文字与必填标记读 `--ms-c` / `--ms-c-glow`。
   * 默认 neutral(沿用普通 fg,不染色);success / danger 可用于「校验通过 / 失败」着色。
   */
  tone?: LabelTone;
  /** 必填标记:文末追加视觉标记(默认 *,aria-hidden 装饰)+ 读屏可读必填语义。与 optional 互斥(required 优先)。 */
  required?: boolean;
  /** 可选标记:文末追加「可选」文字(走 i18n `label.optional`)。与 required 互斥。 */
  optional?: boolean;
  /** 自定义必填标记内容(替换默认 *),如自定义图标 / 文案。 */
  requiredMark?: ReactNode;
  /** 必填标记自身 className(定制颜色 / 间距等)。 */
  requiredClassName?: string;
  /** 禁用态:降透明度、关闭交互态(配合受控表单的 disabled 字段)。 */
  disabled?: boolean;
}

/**
 * Label —— 表单标签(旗舰深度组件)。自研、零依赖,基于原生 label,消费 @magic-scope/tokens 的 --ms-* 变量。
 * size 三档(随密度缩放,对齐控件)、tone 语义色调(读 6 槽位,可做校验着色)、required / optional 互斥标记、
 * requiredMark 可替换标记、disabled 态;必填标记装饰性发光门控于 --ms-fx-glow,尊重 prefers-reduced-motion。
 * 通过 htmlFor 关联控件;根 label 透传所有原生属性 / 事件(onClick 等 compose 不丢用户处理器)。
 * 纯标记决议逻辑在同目录 logic.ts(框架无关,可平移 core)。样式见 Label.css,需引入 @magic-scope/react/styles.css。
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      children,
      size = 'md',
      tone = 'neutral',
      required = false,
      optional = false,
      requiredMark,
      requiredClassName,
      disabled = false,
      className,
      onClick,
      ...props
    },
    ref,
  ) => {
    const t = useMessages();
    const mark = resolveMark(required, optional);
    const classes = resolveLabelClasses({ size, tone, mark, disabled, className });

    return (
      // biome-ignore lint/a11y/noLabelWithoutControl: 通用 Label 封装,与控件的关联由使用者通过 htmlFor 提供
      // biome-ignore lint/a11y/useKeyWithClickEvents: label 的点击是原生语义(转交焦点至关联控件,已具键盘等价路径),onClick 仅在 disabled 时拦截转交,无需自定义键盘处理器
      <label
        ref={ref}
        className={classes}
        aria-disabled={disabled || undefined}
        onClick={composeEventHandlers(onClick, (event) => {
          // 禁用态拦截标签点击(避免转交焦点 / 触发关联控件)
          if (disabled) event.preventDefault();
        })}
        {...props}
      >
        {children}
        {mark === 'required' && (
          <>
            <span
              className={['ms-label__required', requiredClassName].filter(Boolean).join(' ')}
              aria-hidden="true"
            >
              {requiredMark ?? '*'}
            </span>
            <span className="ms-label__sr">{t('label.required', undefined, '必填')}</span>
          </>
        )}
        {mark === 'optional' && (
          <span className="ms-label__optional">{t('label.optional', undefined, '可选')}</span>
        )}
      </label>
    );
  },
);
Label.displayName = 'Label';
