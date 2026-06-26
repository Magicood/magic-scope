import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from 'react';
import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { Popover, type PopoverPlacement } from '../Popover';
import {
  type CascaderOption,
  columnsForValue,
  findEnabledIndex,
  findPath,
  getOptionByPath,
  isLeaf,
  pathLabel,
} from './logic';

export type { CascaderOption } from './logic';

export type CascaderTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type CascaderSize = 'sm' | 'md' | 'lg';

/** 级联各部件的细粒度 className 槽位。 */
export interface CascaderClassNames {
  /** trigger 触发器。 */
  trigger?: string | undefined;
  /** 选中路径 / 占位文字区。 */
  value?: string | undefined;
  /** 末端箭头。 */
  arrow?: string | undefined;
  /** 多列菜单根容器。 */
  menu?: string | undefined;
  /** 单列容器。 */
  column?: string | undefined;
  /** 单个 menuitem 选项。 */
  option?: string | undefined;
}

/** trigger 透传的原生属性(排除被内部接管的键)。 */
type CascaderTriggerProps = Omit<
  ComponentPropsWithoutRef<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'children' | 'type'
>;

export interface CascaderProps extends CascaderTriggerProps {
  /** 级联选项树(`{ value, label, children?, disabled? }`)。 */
  options: CascaderOption[];
  /** 受控选中路径(各层 value 串成数组)。传入即进入受控模式。 */
  value?: string[] | undefined;
  /** 非受控初始路径。 */
  defaultValue?: string[] | undefined;
  /**
   * 路径变化回调。`value` 为选中路径的 value 数组,`optionPath` 为沿途选项数组。
   * 选叶子(或 changeOnSelect 选非叶子)时触发。
   * @param value 选中路径的各层 value 串成的数组。
   * @param optionPath 与 value 对应的沿途选项对象数组(从根到选中节点)。
   */
  onChange?: ((value: string[], optionPath: CascaderOption[]) => void) | undefined;
  /** 受控:浮层是否打开。 */
  open?: boolean | undefined;
  /**
   * 浮层显隐回调。
   * @param open 浮层变化后的开合状态(true 为打开,false 为关闭)。
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * 允许选中非叶子节点:点击 / Enter 任一节点都立即提交并触发 onChange(边选边走)。
   * 关闭时仅叶子可提交,非叶子只展开下一列。默认 false。
   */
  changeOnSelect?: boolean | undefined;
  /** 未选中时的占位文本。默认走 i18n select.placeholder。 */
  placeholder?: string | undefined;
  /** 路径分隔串(显示与默认 aria-label)。默认 ` / `。 */
  separator?: string | undefined;
  /** 语义色调,经全库 tone resolver 派生高亮 / 发光。默认 primary。 */
  tone?: CascaderTone | undefined;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: CascaderSize | undefined;
  /** 浮层相对 trigger 的方位。默认 bottom-start。 */
  placement?: PopoverPlacement | undefined;
  /** 整体禁用。 */
  disabled?: boolean | undefined;
  /** 块级铺满容器。 */
  fullWidth?: boolean | undefined;
  /** 自定义路径显示(覆盖默认的 label 拼接)。 */
  displayRender?: ((labels: string[], optionPath: CascaderOption[]) => ReactNode) | undefined;
  /** 各部件细粒度 className 槽位。 */
  classNames?: CascaderClassNames | undefined;
  /** trigger 附加 className(等价于原生 className)。 */
  className?: string | undefined;
}

/** 当前键盘焦点:列索引 + 该列内选项索引。 */
interface ActiveCell {
  col: number;
  row: number;
}

/**
 * Cascader —— 级联选择(forms,深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * trigger 显示选中路径(`A / B / C`)或占位,复用 Popover 浮层承载**多列级联菜单**:
 * 每展开一级追加一列,hover / 点击非叶子展开下一列,点叶子提交 `value: string[]` 并关闭;
 * changeOnSelect 允许选非叶子边选边触发;disabled 节点不可选;受控(value/open)与非受控双通道。
 * 键盘:↑↓ 列内移动、→ 进下一列、← 回上一列、Enter 选中 / 展开、Esc 关闭;
 * a11y:menu / menuitem + aria-expanded;tone × size(随密度)、留口 classNames / displayRender;
 * 尊重 prefers-reduced-motion 与 [data-ms-motion='off']。纯算法见同目录 logic.ts。样式见 Cascader.css。
 */
export const Cascader = forwardRef<HTMLButtonElement, CascaderProps>(
  (
    {
      options,
      value: controlledValue,
      defaultValue,
      onChange,
      open: controlledOpen,
      onOpenChange,
      changeOnSelect = false,
      placeholder,
      separator = ' / ',
      tone = 'primary',
      size = 'md',
      placement = 'bottom-start',
      disabled = false,
      fullWidth = false,
      displayRender,
      classNames,
      className,
      onKeyDown: userOnKeyDown,
      ...rest
    },
    ref,
  ) => {
    const t = useMessages();
    const rawId = useId();
    const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
    const menuId = `ms-cascader-menu-${safeId}`;

    // —— 受控 / 非受控:选中路径 ——
    const isValueControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
    const value = isValueControlled ? controlledValue : internalValue;

    // —— 受控 / 非受控:浮层开合 ——
    const isOpenControlled = controlledOpen !== undefined;
    const [internalOpen, setInternalOpen] = useState(false);
    const open = isOpenControlled ? controlledOpen : internalOpen;

    // 浏览中的展开前缀:打开浮层时种入当前选中路径,后续随导航更新(不污染已提交 value)。
    const [activePath, setActivePath] = useState<string[]>(value);
    // 键盘焦点单元格(列/行);-1 表示无焦点。
    const [activeCell, setActiveCell] = useState<ActiveCell>({ col: 0, row: -1 });

    const menuRef = useRef<HTMLDivElement | null>(null);

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isOpenControlled) {
          setInternalOpen(next);
        }
        onOpenChange?.(next);
      },
      [isOpenControlled, onOpenChange],
    );

    // 打开时把浏览前缀重置回已选路径,焦点回到第一列已选项(或首个可用项),并把键盘焦点移入菜单容器。
    // biome-ignore lint/correctness/useExhaustiveDependencies: 仅在 open 翻转时重置,读最新 value/options 即可;加入会在浏览中被外部更新打断
    useEffect(() => {
      if (open) {
        setActivePath(value);
        const firstCol = options;
        const sel = firstCol.findIndex((o) => o.value === value[0]);
        // 初始焦点不可落在 disabled 节点:命中且可用才用,否则回退到首个可用项。
        const row = sel >= 0 && !firstCol[sel]?.disabled ? sel : findEnabledIndex(firstCol, 0, 1);
        setActiveCell({ col: 0, row });
        // 等浮层进 top-layer 后再聚焦,使 ↑↓←→ 能落到菜单容器。
        const id = requestAnimationFrame(() => menuRef.current?.focus());
        return () => cancelAnimationFrame(id);
      }
      return undefined;
    }, [open]);

    // 仅受控且 open 时:外部改 value 要同步进浏览前缀,使列随之展开 / 刷新。
    // 非受控不挂(避免边浏览边被自己写回的 value 打断);依赖只含受控值,不碰 activeCell。
    useEffect(() => {
      if (isValueControlled && open) {
        setActivePath(controlledValue ?? []);
      }
    }, [isValueControlled, controlledValue, open]);

    // 当前要渲染的列(按浏览前缀展开)。
    const columns = useMemo(() => columnsForValue(options, activePath), [options, activePath]);

    // trigger 显示:完整选中路径 → label 串 / 自定义渲染;否则占位。
    const selectedPath = useMemo(() => findPath(options, value), [options, value]);
    const isComplete = selectedPath.length === value.length && value.length > 0;
    const resolvedPlaceholder = placeholder ?? t('select.placeholder', undefined, '请选择…');

    const display: ReactNode = useMemo(() => {
      if (!isComplete) {
        return resolvedPlaceholder;
      }
      const labels = selectedPath.map((o) => o.label);
      if (displayRender) {
        return displayRender(labels, selectedPath);
      }
      return pathLabel(selectedPath, separator);
    }, [isComplete, selectedPath, displayRender, separator, resolvedPlaceholder]);

    // 提交一条路径:写值(非受控)+ onChange;叶子或 changeOnSelect 才会关闭浮层。
    const commit = useCallback(
      (path: string[], optionPath: CascaderOption[], close: boolean) => {
        if (!isValueControlled) {
          setInternalValue(path);
        }
        onChange?.(path, optionPath);
        if (close) {
          setOpen(false);
        }
      },
      [isValueControlled, onChange, setOpen],
    );

    // 选中 / 展开某列某节点(指针或键盘共用)。
    const selectNode = useCallback(
      (col: number, option: CascaderOption) => {
        if (option.disabled) {
          return;
        }
        const prefix = activePath.slice(0, col);
        const nextPath = [...prefix, option.value];
        const optionPath = findPath(options, nextPath);
        const leaf = isLeaf(option);

        // 非叶子:展开下一列;changeOnSelect 时也同步提交(不关)。
        setActivePath(nextPath);
        if (leaf) {
          commit(nextPath, optionPath, true);
        } else if (changeOnSelect) {
          commit(nextPath, optionPath, false);
        }
        // 焦点移到这一列的当前行(下一列由 columns 重算后再用 → 进入)。
        const row = (columns[col] ?? []).findIndex((o) => o.value === option.value);
        setActiveCell({ col, row: row >= 0 ? row : 0 });
      },
      [activePath, options, changeOnSelect, commit, columns],
    );

    // —— 键盘导航:↑↓ 列内 / → 下一列 / ← 上一列 / Enter 选 / Esc 关 ——
    const handleMenuKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLDivElement>) => {
        const { col, row } = activeCell;
        const currentCol = columns[col] ?? [];
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          const dir = event.key === 'ArrowDown' ? 1 : -1;
          const start = row < 0 ? (dir === 1 ? 0 : currentCol.length - 1) : row + dir;
          const next = findEnabledIndex(currentCol, start, dir);
          if (next >= 0) {
            setActiveCell({ col, row: next });
          }
          return;
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          const option = row >= 0 ? currentCol[row] : undefined;
          if (option && !option.disabled && !isLeaf(option)) {
            // 展开下一列并把焦点放到下一列首个可用项。
            const prefix = activePath.slice(0, col);
            const nextPath = [...prefix, option.value];
            setActivePath(nextPath);
            const nextColOptions = option.children ?? [];
            const nextRow = findEnabledIndex(nextColOptions, 0, 1);
            setActiveCell({ col: col + 1, row: nextRow });
            if (changeOnSelect) {
              commit(nextPath, findPath(options, nextPath), false);
            }
          }
          return;
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          if (col > 0) {
            // 收起当前列:把浏览前缀截到 col-1 长度,使 columnsForValue 少产出一列;
            // 焦点回到上一列、落在刚才那一列的「父节点」(activePath[col-1])上。
            const prevCol = columns[col - 1] ?? [];
            const parentValue = activePath[col - 1];
            const prevRow = prevCol.findIndex((o) => o.value === parentValue);
            setActivePath(activePath.slice(0, col - 1));
            setActiveCell({
              col: col - 1,
              row: prevRow >= 0 ? prevRow : findEnabledIndex(prevCol, 0, 1),
            });
          }
          return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          const option = row >= 0 ? currentCol[row] : undefined;
          if (option) {
            selectNode(col, option);
          }
          return;
        }
        if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          const dir = event.key === 'Home' ? 1 : -1;
          const start = event.key === 'Home' ? 0 : currentCol.length - 1;
          const next = findEnabledIndex(currentCol, start, dir);
          if (next >= 0) {
            setActiveCell({ col, row: next });
          }
        }
      },
      [activeCell, columns, activePath, options, changeOnSelect, commit, selectNode],
    );

    const triggerClassName = [
      'ms-cascader',
      size !== 'md' && `ms-cascader--${size}`,
      `ms-tone-${tone}`,
      open && 'ms-cascader--open',
      disabled && 'ms-cascader--disabled',
      fullWidth && 'ms-cascader--full',
      !isComplete && 'ms-cascader--placeholder',
      className,
      classNames?.trigger,
    ]
      .filter(Boolean)
      .join(' ');

    const ariaPathLabel = isComplete ? pathLabel(selectedPath, separator) : resolvedPlaceholder;

    const triggerNode = (
      <button
        ref={ref}
        type="button"
        className={triggerClassName}
        disabled={disabled}
        // 注:aria-haspopup / aria-expanded / aria-controls 由 Popover 注入并管理(指向其浮层),
        // 此处不再自挂以免被覆盖;菜单语义由内部 menu/menuitem 子树承载。
        data-ms-density-target=""
        {...rest}
      >
        <span
          className={['ms-cascader__value', classNames?.value].filter(Boolean).join(' ')}
          data-placeholder={isComplete ? undefined : ''}
        >
          {display}
        </span>
        <span
          className={['ms-cascader__arrow', classNames?.arrow].filter(Boolean).join(' ')}
          aria-hidden="true"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
            <path
              d="M4 6l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    );

    // 列内选项:hover 展开 / 点击选中或展开;disabled 不可交互。
    // 用 div + role 而非 ul/li:避免「非交互语义元素承载交互 role」告警,
    // 同时保持 WAI-ARIA menu/menuitem 语义(焦点集中在 menu 容器,roving 由 data-active 表达)。
    const renderColumn = (colOptions: CascaderOption[], col: number): ReactNode => {
      return (
        <div
          role="menu"
          aria-label={t('select.placeholder', undefined, '请选择…')}
          className={['ms-cascader__column', classNames?.column].filter(Boolean).join(' ')}
          key={`col-${col}`}
        >
          {colOptions.map((option, row) => {
            const leaf = isLeaf(option);
            const expanded = !leaf && activePath[col] === option.value;
            const selected = value[col] === option.value;
            const isActive = activeCell.col === col && activeCell.row === row;
            const optionClass = [
              'ms-cascader__option',
              leaf && 'ms-cascader__option--leaf',
              expanded && 'ms-cascader__option--expanded',
              selected && 'ms-cascader__option--selected',
              option.disabled && 'ms-cascader__option--disabled',
              isActive && 'ms-cascader__option--active',
              classNames?.option,
            ]
              .filter(Boolean)
              .join(' ');
            return (
              // biome-ignore lint/a11y/useKeyWithClickEvents: 键盘交互在 menu 容器统一处理(roving 模型);option 仅响应指针
              <div
                key={option.value}
                role="menuitem"
                // option 不进 Tab 序;焦点由 menu 容器 + data-active 表达(WAI-ARIA menu 模式)
                tabIndex={-1}
                className={optionClass}
                aria-disabled={option.disabled || undefined}
                aria-haspopup={leaf ? undefined : 'menu'}
                aria-expanded={leaf ? undefined : expanded}
                data-active={isActive || undefined}
                onClick={() => selectNode(col, option)}
                onPointerEnter={() => {
                  if (option.disabled || leaf) {
                    return;
                  }
                  // hover 非叶子:展开下一列(不提交),并把焦点落到该项。
                  const prefix = activePath.slice(0, col);
                  setActivePath([...prefix, option.value]);
                  setActiveCell({ col, row });
                }}
              >
                <span className="ms-cascader__option-label">{option.label}</span>
                {!leaf && (
                  <span className="ms-cascader__option-caret" aria-hidden="true">
                    <svg
                      viewBox="0 0 16 16"
                      width="12"
                      height="12"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        d="M6 4l4 4-4 4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <Popover
        trigger={triggerNode}
        open={open}
        onOpenChange={setOpen}
        placement={placement}
        triggerAction="click"
        tone={tone === 'primary' ? 'neutral' : tone}
        classNames={{ panel: 'ms-cascader-menu-panel' }}
      >
        {/* biome-ignore lint/a11y/noStaticElementInteractions: 容器是 roving-tabindex 键盘宿主,焦点集中于此统一分发 ↑↓←→/Enter 到各列 menu */}
        <div
          ref={menuRef}
          id={menuId}
          className={['ms-cascader-menu', classNames?.menu].filter(Boolean).join(' ')}
          data-ms-size={size}
          tabIndex={-1}
          style={{ '--ms-cascader-cols': columns.length } as CSSProperties}
          onKeyDown={composeEventHandlers(
            userOnKeyDown as ((e: ReactKeyboardEvent<HTMLDivElement>) => void) | undefined,
            handleMenuKeyDown,
          )}
        >
          {/* 仅打开时挂载列内容:关闭时浮层虽留在 DOM(top-layer 降级),但不渲染选项,
              避免 disabled / 关闭态下仍能命中 menuitem。 */}
          {!open ? null : columns.length === 0 || (columns[0]?.length ?? 0) === 0 ? (
            <div className="ms-cascader__empty">{t('select.empty', undefined, '无匹配项')}</div>
          ) : (
            columns.map((colOptions, col) => renderColumn(colOptions, col))
          )}
        </div>
        {/* a11y 兜底:把当前焦点路径以可读串暴露给读屏(随键盘移动更新)。 */}
        <span className="ms-cascader__sr-status" aria-live="polite">
          {getOptionByPath(options, activePath)?.label ?? ariaPathLabel}
        </span>
      </Popover>
    );
  },
);
Cascader.displayName = 'Cascader';
