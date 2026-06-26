import type { ComponentPropsWithoutRef, CSSProperties, ElementType, ReactNode } from 'react';
import { forwardRef } from 'react';
import { useMessages } from '../../i18n';
import {
  type DescriptionsItem,
  type ResponsiveColumns,
  resolveRows,
  spreadColumnVars,
} from './logic';

export type { DescriptionsItem, ResponsiveColumns } from './logic';

export type DescriptionsSize = 'sm' | 'md' | 'lg';
export type DescriptionsLayout = 'horizontal' | 'vertical';
export type DescriptionsTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** 部件级 className 定制(根 className 走 props.className)。 */
export interface DescriptionsClassNames {
  /** 头部容器(title + extra)。 */
  header?: string;
  /** 标题文本。 */
  title?: string;
  /** 头部右侧 extra 槽。 */
  extra?: string;
  /** 内容主体(grid 容器)。 */
  body?: string;
  /** 单条项的标签格。 */
  label?: string;
  /** 单条项的内容格。 */
  content?: string;
}

/** Descriptions 根可用的多态标签子集(语义化容器,默认 div)。 */
type DescriptionsElement = 'div' | 'section' | 'article' | 'aside' | 'dl';

export interface DescriptionsOwnProps {
  /** 描述项数据(也可改用 Descriptions.Item 复合子组件;两者择一,items 优先)。 */
  items?: DescriptionsItem[] | undefined;
  /**
   * 列数:
   * - `number` → 固定逻辑列数(默认 3);
   * - 断点对象 → 各断点列数(如 `{ base: 1, md: 2, lg: 3 }`),随屏收窄,
   *   靠每断点一个 CSS 变量 + Descriptions.css 静态 @media 级联(条件里 var() 不生效)。
   */
  columns?: ResponsiveColumns;
  /** 带边框表格态(单元描边 + 标签底色)。默认 false。 */
  bordered?: boolean;
  /** 尺寸(随密度缩放间距与字号)。默认 md。 */
  size?: DescriptionsSize;
  /** 排布:horizontal(标签内容同行)默认 / vertical(标签在上、内容在下)。 */
  layout?: DescriptionsLayout;
  /** 标签后是否带冒号(horizontal 态生效)。默认 true。 */
  colon?: boolean;
  /** 语义色调:派生标签底色 / 描边强调 / 发光。默认 neutral。 */
  tone?: DescriptionsTone;
  /** 标题(ReactNode 槽,放在头部左侧)。 */
  title?: ReactNode;
  /** 头部右侧附加内容(操作 / 状态 ReactNode 槽)。 */
  extra?: ReactNode;
  /** 部件级 className。 */
  classNames?: DescriptionsClassNames | undefined;
  /** 空数据时的占位文案(默认走 i18n empty.description)。 */
  emptyText?: ReactNode;
  /** 多态:渲染为指定标签(默认 div)。 */
  as?: DescriptionsElement;
}

export type DescriptionsProps = DescriptionsOwnProps &
  Omit<ComponentPropsWithoutRef<'div'>, keyof DescriptionsOwnProps>;

/** 把 Descriptions.Item 子组件转成 items 数据(从 children 提取)。 */
export interface DescriptionsItemProps extends DescriptionsItem {
  /** 项内容(value 的 JSX 形态;value/children 二者择一,value 优先)。 */
  children?: ReactNode;
}

/**
 * Descriptions.Item —— 仅承载数据的「标记型」子组件(不直接渲染,由父 Descriptions 收集成 items)。
 * 直接渲染时退化为透传内容的 div(便于在非 Descriptions 上下文中复用 children)。
 */
export function DescriptionsItemComponent(props: DescriptionsItemProps): ReactNode {
  return props.children ?? null;
}
DescriptionsItemComponent.displayName = 'Descriptions.Item';

/** 单格内容空判定:用于「无 value 也无 children」时渲染占位短横,避免空格塌陷。 */
function isEmptyContent(node: ReactNode): boolean {
  return node == null || node === '' || (Array.isArray(node) && node.length === 0);
}

const DescriptionsRoot = forwardRef<HTMLDivElement, DescriptionsProps>((props, ref) => {
  const {
    items,
    columns = 3,
    bordered = false,
    size = 'md',
    layout = 'horizontal',
    colon = true,
    tone = 'neutral',
    title,
    extra,
    classNames,
    emptyText,
    as,
    className,
    style,
    children,
    ...rest
  } = props;

  const t = useMessages();
  const Tag = (as ?? 'div') as ElementType;

  // 优先 items 数据入口;否则从 Descriptions.Item 子组件提取(复合子组件形态)。
  const resolvedItems: DescriptionsItem[] = items ?? collectItemsFromChildren(children);

  // 用 base 列数做行折叠(filler 补齐 + span 截断);CSS 负责响应式重排。
  const baseColumns = resolveBaseColumns(columns);
  const rows = resolveRows(resolvedItems, baseColumns);

  const colVars = spreadColumnVars(columns, 3);
  const mergedStyle: CSSProperties = { ...colVars, ...style };

  const classes = [
    'ms-descriptions',
    `ms-descriptions--${size}`,
    `ms-descriptions--${layout}`,
    `ms-tone-${tone}`,
    bordered && 'ms-descriptions--bordered',
    colon && layout === 'horizontal' && 'ms-descriptions--colon',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const hasHeader = title != null || extra != null;
  const resolvedEmpty = emptyText ?? t('empty.description', undefined, '暂无数据');

  return (
    <Tag ref={ref} className={classes} style={mergedStyle} {...rest}>
      {hasHeader && (
        <div className={['ms-descriptions__header', classNames?.header].filter(Boolean).join(' ')}>
          {title != null && (
            <div
              className={['ms-descriptions__title', classNames?.title].filter(Boolean).join(' ')}
            >
              {title}
            </div>
          )}
          {extra != null && (
            <div
              className={['ms-descriptions__extra', classNames?.extra].filter(Boolean).join(' ')}
            >
              {extra}
            </div>
          )}
        </div>
      )}

      <div
        className={['ms-descriptions__body', classNames?.body].filter(Boolean).join(' ')}
        role="presentation"
      >
        {resolvedItems.length === 0 ? (
          <div className="ms-descriptions__empty">{resolvedEmpty}</div>
        ) : (
          rows.map((row, rowIndex) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: 行无稳定身份,索引即其在折行结果中的位置,稳定
              key={`row-${rowIndex}`}
              className="ms-descriptions__row"
            >
              {row.map((cell) => {
                if (cell.filler) {
                  return (
                    <div
                      key={cell.key}
                      className="ms-descriptions__cell ms-descriptions__cell--filler"
                      style={{ '--ms-desc-span': cell.span } as CSSProperties}
                      aria-hidden="true"
                    />
                  );
                }
                const { item } = cell;
                const content = item.value !== undefined ? item.value : item.children;
                return (
                  <div
                    key={cell.key}
                    className="ms-descriptions__cell"
                    style={{ '--ms-desc-span': cell.span } as CSSProperties}
                  >
                    <div
                      className={['ms-descriptions__label', item.labelClassName, classNames?.label]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span className="ms-descriptions__label-text">{item.label}</span>
                    </div>
                    <div
                      className={['ms-descriptions__content', item.className, classNames?.content]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {isEmptyContent(content) ? (
                        <span className="ms-descriptions__placeholder" aria-hidden="true">
                          —
                        </span>
                      ) : (
                        content
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </Tag>
  );
});
DescriptionsRoot.displayName = 'Descriptions';

/** 从 children 里提取 Descriptions.Item 的 props 为 items(复合子组件入口)。 */
function collectItemsFromChildren(children: ReactNode): DescriptionsItem[] {
  const out: DescriptionsItem[] = [];
  const visit = (node: ReactNode): void => {
    if (node == null || typeof node === 'boolean') return;
    if (Array.isArray(node)) {
      for (const n of node) visit(n);
      return;
    }
    if (typeof node === 'object' && 'type' in node && 'props' in node) {
      const el = node as { type: unknown; props: DescriptionsItemProps };
      if (el.type === DescriptionsItemComponent) {
        const p = el.props;
        out.push({
          key: p.key,
          label: p.label,
          value: p.value !== undefined ? p.value : p.children,
          span: p.span,
          className: p.className,
          labelClassName: p.labelClassName,
        });
      }
    }
  };
  visit(children);
  return out;
}

/** 列数取 base 档(响应式对象取 base;无 base 取最小已声明断点;单值原样;默认 3)。 */
function resolveBaseColumns(columns: ResponsiveColumns): number {
  if (typeof columns === 'number') return Math.max(1, Math.floor(columns));
  const order: Array<keyof typeof columns> = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];
  for (const bp of order) {
    const v = columns[bp];
    if (v !== undefined) return Math.max(1, Math.floor(v));
  }
  return 3;
}

/**
 * Descriptions —— 描述列表(键值展示,旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 数据入口双通道:`items` 数组,或 `Descriptions.Item` 复合子组件;span 跨列、行末 filler 补齐由
 * 纯逻辑层 resolveRows 计算(可单测、可平移其它框架)。布局用 CSS Grid:horizontal(标签内容同行)
 * 与 vertical(标签在上内容在下),列数支持响应式断点对象(每断点一个 CSS 变量 + 静态 @media 级联,
 * 条件里 var() 不生效)。bordered 表格态、size 三档随密度缩放、colon、tone 语义色(标签底/强调描边/发光)。
 *
 * 留口:title/extra/emptyText 的 ReactNode 槽、classNames 部件级定制、多态 as、...rest 透传到根。
 * i18n:空态走 empty.description。样式见同目录 Descriptions.css,需引入 @magic-scope/react/styles.css。
 */
type DescriptionsComponent = typeof DescriptionsRoot & { Item: typeof DescriptionsItemComponent };
export const Descriptions = DescriptionsRoot as DescriptionsComponent;
Descriptions.Item = DescriptionsItemComponent;

// 注:数据项类型 `DescriptionsItem`(来自 logic)已占用该名;复合子组件以 `Descriptions.Item`
// 或具名 `DescriptionsItemComponent` 引用(避免与类型撞名)。
