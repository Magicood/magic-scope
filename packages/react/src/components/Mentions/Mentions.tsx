import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  CSSProperties,
  KeyboardEvent,
  ReactNode,
} from 'react';
import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import {
  computeInsertion,
  detectMention,
  filterOptions,
  firstEnabledIndex,
  type MentionMatch,
  type MentionOptionLike,
  nextEnabledIndex,
} from './logic';

export type MentionsSize = 'sm' | 'md' | 'lg';
export type MentionsTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

/** 单个 @候选项。 */
export interface MentionOption extends MentionOptionLike {
  /** 候选值(选中后回填到文本、传给 onSelect)。 */
  value: string;
  /** 候选显示文本。 */
  label: string;
  /** 候选前置内容(头像 / 图标)。 */
  icon?: ReactNode;
  /** 候选副描述(label 下方弱化文本,如 @handle / 部门)。 */
  description?: ReactNode;
  /** 是否禁用该候选(不可选中、不进高亮)。 */
  disabled?: boolean;
}

/** 关键子部件 className(细粒度留口)。 */
export interface MentionsClassNames {
  /** 包裹容器(根)。 */
  root?: string | undefined;
  /** 原生 textarea 自身。 */
  textarea?: string | undefined;
  /** 建议浮层 listbox 容器。 */
  list?: string | undefined;
  /** 单个候选 option。 */
  option?: string | undefined;
  /** 空态 / 加载态状态行。 */
  status?: string | undefined;
}

export interface MentionsProps
  extends Omit<
    ComponentPropsWithoutRef<'textarea'>,
    'size' | 'className' | 'prefix' | 'onSelect' | 'value' | 'defaultValue' | 'onChange'
  > {
  /** 当前文本(受控)。 */
  value?: string | undefined;
  /** 默认文本(非受控)。 */
  defaultValue?: string | undefined;
  /**
   * 文本变化回调(受控 / 非受控均触发,含选中候选回填导致的变化)。
   * @param value 变化后的完整文本。
   */
  onChange?: (value: string) => void;
  /**
   * 触发前缀。单字符串或数组(多前缀,如 ['@','#'])。默认 "@"。
   * 注意:多前缀建议每个都为单字符;非单字符前缀请显式保证 split 不与之冲突。
   */
  prefix?: string | string[];
  /** 候选项列表(静态)。与 onSearch 二选一;同时给时 onSearch 负责异步、options 作为当前可见集。 */
  options?: MentionOption[];
  /**
   * 异步加载候选:query 变化时调用,期间走 loading 态。调用方据 query 拉数据后更新 options。
   * @param query 当前 @ 之后、光标之前的查询文本。
   */
  onSearch?: (query: string) => void;
  /** 异步加载中:建议列表显示加载文案(走 i18n select.loading)。 */
  loading?: boolean;
  /** 选中候选后,回填文本时追加的分隔符。默认空格 " "。 */
  split?: string;
  /**
   * 选中某个候选时触发(回填文本之外的副作用钩子)。
   * @param option 被选中的完整候选项。
   * @param prefix 本次触发所用的前缀。
   */
  onSelect?: (option: MentionOption, prefix: string) => void;
  /** 尺寸。默认 md。(影响 font-size 与 min-block-size,min-block-size 随密度缩放) */
  size?: MentionsSize;
  /** 聚焦发光环色调;invalid 时强制 danger。默认 primary。 */
  tone?: MentionsTone;
  /** 校验失败态:染 danger 色并设 aria-invalid。 */
  invalid?: boolean;
  /** 禁用整个控件。 */
  disabled?: boolean;
  /** 根容器 className。 */
  className?: string;
  /** 各关键子部件 className(细粒度留口)。 */
  classNames?: MentionsClassNames;
}

/** 把 prefix prop 归一化为非空字符串数组。 */
function normalizePrefixes(prefix: string | string[] | undefined): string[] {
  if (prefix === undefined) {
    return ['@'];
  }
  const arr = Array.isArray(prefix) ? prefix : [prefix];
  const cleaned = arr.filter((p) => p.length > 0);
  return cleaned.length > 0 ? cleaned : ['@'];
}

/**
 * Mentions —— @提及输入(深度组件)。自研、零依赖,基于原生 textarea,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 能力:输入 @(可配多前缀)即弹候选浮层;query 实时过滤(filterOptions)或 onSearch 异步加载(配 loading);
 * 选中后把 @query 段替换成候选 + 分隔符(computeInsertion)并把光标落到分隔符后;键盘 ↑↓ 移高亮、
 * Enter/Tab 选中、Esc 关;受控 / 非受控双通道;tone 聚焦发光环(invalid→danger);尺寸随密度缩放。
 *
 * 纯算法在同目录 logic.ts(detectMention / filterOptions / computeInsertion,零 React、单测覆盖),
 * 组件只把它们接进 textarea(读 selectionStart、写 value、设光标)。
 *
 * a11y:textarea 标 role=combobox + aria-autocomplete=list + aria-expanded/aria-controls/aria-activedescendant,
 * 候选浮层 role=listbox、候选 role=option,完整键盘可达。
 *
 * 诚实备注:近光标精确定位(让浮层贴着 caret 弹)需要镜像 textarea 计算坐标,较复杂;
 * v1 把浮层锚在控件下方(贴 textarea 左下),功能完整、定位稳。后续可加近光标定位作为增强。
 *
 * 留口:className + classNames(root/textarea/list/option/status)细粒度定制;...rest 透传所有原生属性 / 事件到 textarea;
 * 内部接管的 onChange / onKeyDown / onBlur 用 composeEventHandlers 合并(先用户的、未 preventDefault 再做内部的)。
 * forwardRef 指向原生 textarea。样式见 Mentions.css,需引入 @magic-scope/react/styles.css。
 */
export const Mentions = forwardRef<HTMLTextAreaElement, MentionsProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      prefix,
      options,
      onSearch,
      loading = false,
      split = ' ',
      onSelect,
      size = 'md',
      tone = 'primary',
      invalid = false,
      disabled = false,
      className,
      classNames,
      onKeyDown,
      onBlur,
      onClick,
      onFocus,
      style,
      rows = 3,
      ...rest
    },
    ref,
  ) => {
    const t = useMessages();
    const reactId = useId();
    const safeId = reactId.replace(/[^a-zA-Z0-9_-]/g, '');
    const listboxId = `ms-mentions-list-${safeId}`;
    const optionId = (i: number) => `${listboxId}-opt-${i}`;

    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as { current: HTMLTextAreaElement | null }).current = node;
        }
      },
      [ref],
    );

    const isControlled = value !== undefined;
    const [internal, setInternal] = useState(defaultValue ?? '');
    const text = isControlled ? (value ?? '') : internal;

    const prefixes = normalizePrefixes(prefix);
    // prefixes 仅作内部就近匹配用;join 当依赖以避免每次 render 新数组引用导致 effect 抖动。
    const prefixKey = prefixes.join(' ');

    // 当前触发段(光标前最近的 @query);active 决定浮层显隐。
    const [match, setMatch] = useState<MentionMatch>({
      active: false,
      prefix: '',
      query: '',
      start: -1,
    });
    const [activeIndex, setActiveIndex] = useState(0);

    // 可见候选:静态 options 时本地按 query 过滤;onSearch 异步时由调用方喂 options(直接用)。
    const allOptions = options ?? [];
    const visibleOptions = onSearch ? allOptions : filterOptions(allOptions, match.query);

    const isOpen = match.active && !disabled;

    // 渲染期解析「有效高亮」:若存储的 activeIndex 越界或落在 disabled 项,
    // 同步回退到首个可选项(绝不裸落 0 / 禁用项)。键盘、aria、回填都以此为准,
    // 不依赖 effect 时序,保证开浮层当帧就正确。全禁用时为 -1。
    const storedActive = activeIndex;
    const resolvedActiveIndex =
      storedActive >= 0 &&
      storedActive < visibleOptions.length &&
      !visibleOptions[storedActive]?.disabled
        ? storedActive
        : firstEnabledIndex(visibleOptions);

    // 关闭浮层并复位高亮。
    const close = useCallback(() => {
      setMatch({ active: false, prefix: '', query: '', start: -1 });
      setActiveIndex(0);
    }, []);

    // 从 textarea 当前 value + 光标算出触发段;query 变化时通知 onSearch。
    const syncFromCaret = useCallback(
      (nextText: string) => {
        const el = innerRef.current;
        const caret = el ? (el.selectionStart ?? nextText.length) : nextText.length;
        const next = detectMention(nextText, caret, prefixKey.split(' '));
        setMatch((prev) => {
          // query 变化(或新激活)→ 异步搜索 + 高亮归零。
          if (next.active && (next.query !== prev.query || !prev.active)) {
            onSearch?.(next.query);
            setActiveIndex(0);
          }
          return next;
        });
      },
      [prefixKey, onSearch],
    );

    const commitValue = useCallback(
      (nextText: string) => {
        if (!isControlled) {
          setInternal(nextText);
        }
        onChange?.(nextText);
      },
      [isControlled, onChange],
    );

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLTextAreaElement>) => {
        const next = event.target.value;
        commitValue(next);
        syncFromCaret(next);
      },
      [commitValue, syncFromCaret],
    );

    // 选中候选:用 computeInsertion 把 @query 段替换成 prefix+label + split,设新光标,关闭浮层。
    const selectOption = useCallback(
      (opt: MentionOption | undefined) => {
        if (!opt || opt.disabled || match.start < 0) {
          return;
        }
        const insertText = `${match.prefix}${opt.label}`;
        const { nextText, nextCaret } = computeInsertion(
          text,
          match.start,
          match.query,
          insertText,
          split,
          match.prefix.length,
        );
        commitValue(nextText);
        onSelect?.(opt, match.prefix);
        close();
        // 回填后把光标移到分隔符之后(下一帧,等受控 value 落地)。
        requestAnimationFrame(() => {
          const el = innerRef.current;
          if (el) {
            el.focus();
            el.setSelectionRange(nextCaret, nextCaret);
          }
        });
      },
      [match, text, split, commitValue, onSelect, close],
    );

    // —— 键盘:浮层开时拦 ↑↓/Enter/Tab/Esc;关时不拦,放行原生编辑 ——
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isOpen) {
          return;
        }
        const count = visibleOptions.length;
        switch (event.key) {
          case 'ArrowDown': {
            event.preventDefault();
            // 从「有效高亮」出发循环找下一个非 disabled 候选;全禁用(-1)则不动。
            {
              const next = nextEnabledIndex(visibleOptions, resolvedActiveIndex, 1);
              if (next >= 0) {
                setActiveIndex(next);
              }
            }
            break;
          }
          case 'ArrowUp': {
            event.preventDefault();
            {
              const next = nextEnabledIndex(visibleOptions, resolvedActiveIndex, -1);
              if (next >= 0) {
                setActiveIndex(next);
              }
            }
            break;
          }
          case 'Enter':
          case 'Tab': {
            const opt = resolvedActiveIndex >= 0 ? visibleOptions[resolvedActiveIndex] : undefined;
            if (opt && !opt.disabled) {
              // 有可选高亮项时拦截 Enter/Tab 用于选中。
              event.preventDefault();
              selectOption(opt);
            } else if (event.key === 'Enter' && count > 0) {
              // 浮层开着但当前高亮为禁用项(或越界)→ Enter 仍要 preventDefault,
              // 否则会漏到 textarea 插入换行(典型:首项 disabled、初始高亮停在该项)。
              event.preventDefault();
            }
            break;
          }
          case 'Escape': {
            event.preventDefault();
            close();
            break;
          }
          default:
            break;
        }
      },
      [isOpen, visibleOptions, resolvedActiveIndex, selectOption, close],
    );

    // 失焦关闭(下一帧判,避免点击候选时的 blur 抢先关掉浮层 —— 候选用 onMouseDown 选中,先于 blur)。
    const handleBlur = useCallback(() => {
      requestAnimationFrame(() => {
        const el = innerRef.current;
        const root = el?.ownerDocument.activeElement;
        // 焦点仍在控件内(理论上不会,因候选不可聚焦)则不关。
        if (root !== el) {
          close();
        }
      });
    }, [close]);

    // 点击 / 方向键移动光标也可能进出提及段,重新同步。
    const handleClick = useCallback(() => {
      syncFromCaret(text);
    }, [syncFromCaret, text]);

    // 把存储的 activeIndex 同步到「有效高亮」,保证状态与渲染一致(渲染期已用
    // resolvedActiveIndex 兜底正确性,这里仅消除存储态漂移)。全禁用(-1)时不写。
    useEffect(() => {
      if (resolvedActiveIndex >= 0 && resolvedActiveIndex !== storedActive) {
        setActiveIndex(resolvedActiveIndex);
      }
    }, [resolvedActiveIndex, storedActive]);

    const resolvedTone = invalid ? 'danger' : tone;

    const rootClassName = [
      'ms-mentions',
      `ms-tone-${resolvedTone}`,
      disabled && 'ms-mentions--disabled',
      className,
      classNames?.root,
    ]
      .filter(Boolean)
      .join(' ');

    const textareaClassName = [
      'ms-mentions__textarea',
      `ms-mentions__textarea--${size}`,
      invalid && 'ms-mentions__textarea--invalid',
      classNames?.textarea,
    ]
      .filter(Boolean)
      .join(' ');

    const listClassName = ['ms-mentions__list', classNames?.list].filter(Boolean).join(' ');
    const statusClassName = ['ms-mentions__status', classNames?.status].filter(Boolean).join(' ');

    const renderListBody = () => {
      if (loading) {
        return (
          <div className={statusClassName} role="status">
            {t('select.loading', undefined, '加载中…')}
          </div>
        );
      }
      if (visibleOptions.length === 0) {
        return <div className={statusClassName}>{t('select.empty', undefined, '无匹配项')}</div>;
      }
      return visibleOptions.map((opt, index) => {
        const isActive = index === resolvedActiveIndex;
        return (
          // biome-ignore lint/a11y/useFocusableInteractive: option 不进 Tab 序;焦点留在 textarea,由 aria-activedescendant 表达(WAI-ARIA listbox 模式)
          <div
            key={opt.value}
            id={optionId(index)}
            role="option"
            aria-selected={isActive}
            aria-disabled={opt.disabled || undefined}
            data-active={isActive ? '' : undefined}
            className={[
              'ms-mentions__option',
              opt.disabled && 'ms-mentions__option--disabled',
              classNames?.option,
            ]
              .filter(Boolean)
              .join(' ')}
            // onMouseDown 而非 onClick:先于 textarea 的 blur 触发,避免失焦关闭抢跑;
            // preventDefault 阻止焦点离开 textarea。
            onMouseDown={(e) => {
              e.preventDefault();
              if (!opt.disabled) {
                selectOption(opt);
              }
            }}
            onMouseMove={() => {
              if (!opt.disabled) {
                setActiveIndex(index);
              }
            }}
          >
            {opt.icon != null && (
              <span className="ms-mentions__option-icon" aria-hidden="true">
                {opt.icon}
              </span>
            )}
            <span className="ms-mentions__option-body">
              <span className="ms-mentions__option-label">{opt.label}</span>
              {opt.description != null && (
                <span className="ms-mentions__option-desc">{opt.description}</span>
              )}
            </span>
          </div>
        );
      });
    };

    const activeDescendant =
      isOpen && !loading && resolvedActiveIndex >= 0 && visibleOptions[resolvedActiveIndex]
        ? optionId(resolvedActiveIndex)
        : undefined;

    return (
      <div className={rootClassName}>
        <textarea
          ref={setRef}
          rows={rows}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          // combobox 模型:textarea 是 combobox,候选浮层是 listbox。
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          {...(activeDescendant ? { 'aria-activedescendant': activeDescendant } : {})}
          className={textareaClassName}
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          style={style as CSSProperties}
          onChange={handleChange}
          onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
          onBlur={composeEventHandlers(onBlur, handleBlur)}
          onClick={composeEventHandlers(onClick, handleClick)}
          onFocus={onFocus}
          {...rest}
        />
        {isOpen && (
          <div
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-label={t('select.placeholder', undefined, '请选择…')}
            className={listClassName}
          >
            {renderListBody()}
          </div>
        )}
      </div>
    );
  },
);
Mentions.displayName = 'Mentions';
