import type { CSSProperties, KeyboardEvent } from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  /** 选项值。 */
  value: string;
  /** 选项显示文本。 */
  label: string;
  /** 是否禁用该选项。 */
  disabled?: boolean;
}

export interface SelectProps {
  /** 当前选中值(受控)。 */
  value?: string;
  /** 选中变化回调。 */
  onChange?: (value: string) => void;
  /** 选项列表。 */
  options: SelectOption[];
  /** 未选中时的占位文本。 */
  placeholder?: string;
  /** 尺寸。默认 md。 */
  size?: SelectSize;
  /** 是否禁用整个选择器。 */
  disabled?: boolean;
  /** trigger 的无障碍名称(无可见 label 时建议提供)。 */
  'aria-label'?: string;
  /** 关联可见 label 的 id。 */
  'aria-labelledby'?: string;
  /** 附加类名。 */
  className?: string;
  /** trigger 的 id。 */
  id?: string;
  /** trigger 的 name(用于表单语义,非真实表单控件)。 */
  name?: string;
}

/**
 * Select —— 下拉选择。自研、零依赖,用满平台原生能力:
 * 浮层进 top-layer 用 Popover API(popover="auto" 自带点外/Esc 关闭),
 * 定位用 CSS Anchor Positioning(anchor-name + position-anchor + position-area),
 * 并以 @supports 降级为普通 absolute 贴近,保证不支持时仍可用。
 * 键盘交互(↑↓/Enter/Space/Esc/Home/End)自实现;受控 value;完整 focus-visible 发光与 disabled。
 * 样式见 Select.css,需引入 @magic-scope/react/styles.css。
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      value,
      onChange,
      options,
      placeholder = '请选择…',
      size = 'md',
      disabled = false,
      className,
      id,
      name,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
    },
    ref,
  ) => {
    const reactId = useId();
    // anchor-name 必须以 -- 开头,且每个实例唯一;useId 含冒号,清洗为合法标识符。
    const anchorName = `--ms-select-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
    const listboxId = `ms-select-list-${reactId}`;
    const triggerId = id ?? `ms-select-trigger-${reactId}`;

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const listboxRef = useRef<HTMLDivElement | null>(null);

    const [open, setOpen] = useState(false);
    // 高亮项索引(键盘导航焦点),独立于选中值。
    const [activeIndex, setActiveIndex] = useState(-1);

    useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement, []);

    const selectedIndex = options.findIndex((o) => o.value === value);
    const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

    // 找到从给定起点开始(含)的下一个可用项;dir 为 +1/-1。
    const findEnabled = useCallback(
      (start: number, dir: 1 | -1): number => {
        const n = options.length;
        if (n === 0) {
          return -1;
        }
        let i = start;
        for (let step = 0; step < n; step++) {
          if (i < 0) {
            i = n - 1;
          } else if (i >= n) {
            i = 0;
          }
          if (!options[i]?.disabled) {
            return i;
          }
          i += dir;
        }
        return -1;
      },
      [options],
    );

    // 同步 Popover 显隐:open 变化时调用原生 show/hidePopover(带降级保护)。
    useEffect(() => {
      const el = listboxRef.current;
      if (!el) {
        return;
      }
      // 仅当浏览器支持 Popover API 时调用;否则靠 CSS([data-open])控制显隐。
      const supportsPopover = typeof el.showPopover === 'function' && el.hasAttribute('popover');
      if (open) {
        if (supportsPopover) {
          try {
            el.showPopover?.();
          } catch {
            // 已显示时重复调用会抛错,忽略。
          }
        }
      } else if (supportsPopover) {
        try {
          el.hidePopover?.();
        } catch {
          // 已隐藏时忽略。
        }
      }
    }, [open]);

    // 打开时把高亮定位到选中项(或首个可用项),并将焦点移入 listbox。
    useEffect(() => {
      if (!open) {
        return;
      }
      const start = selectedIndex >= 0 ? selectedIndex : findEnabled(0, 1);
      setActiveIndex(start);
      const el = listboxRef.current;
      // 等浮层进入 top-layer 后再聚焦,确保可获得焦点。
      const raf = requestAnimationFrame(() => el?.focus());
      return () => cancelAnimationFrame(raf);
    }, [open, selectedIndex, findEnabled]);

    const closeAndFocusTrigger = useCallback(() => {
      setOpen(false);
      triggerRef.current?.focus();
    }, []);

    const commit = useCallback(
      (index: number) => {
        const opt = options[index];
        if (!opt || opt.disabled) {
          return;
        }
        onChange?.(opt.value);
        closeAndFocusTrigger();
      },
      [options, onChange, closeAndFocusTrigger],
    );

    // trigger 键盘:↑↓/Enter/Space 打开;打开后焦点已在 listbox,这里只处理关闭态。
    const onTriggerKeyDown = useCallback(
      (e: KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) {
          return;
        }
        switch (e.key) {
          case 'ArrowDown':
          case 'ArrowUp':
          case 'Enter':
          case ' ':
          case 'Spacebar':
            e.preventDefault();
            setOpen(true);
            break;
          default:
            break;
        }
      },
      [disabled],
    );

    // listbox 键盘:导航/选中/关闭。
    const onListKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setActiveIndex((i) => findEnabled((i < 0 ? -1 : i) + 1, 1));
            break;
          case 'ArrowUp':
            e.preventDefault();
            setActiveIndex((i) => findEnabled((i < 0 ? options.length : i) - 1, -1));
            break;
          case 'Home':
            e.preventDefault();
            setActiveIndex(findEnabled(0, 1));
            break;
          case 'End':
            e.preventDefault();
            setActiveIndex(findEnabled(options.length - 1, -1));
            break;
          case 'Enter':
          case ' ':
          case 'Spacebar':
            e.preventDefault();
            if (activeIndex >= 0) {
              commit(activeIndex);
            }
            break;
          case 'Escape':
            e.preventDefault();
            closeAndFocusTrigger();
            break;
          case 'Tab':
            // Tab 离开即关闭,保持原生 Tab 顺序。
            setOpen(false);
            break;
          default:
            break;
        }
      },
      [activeIndex, options.length, findEnabled, commit, closeAndFocusTrigger],
    );

    // popover="auto" 点外/Esc 关闭会触发 toggle 事件,据此同步 React 状态。
    const onToggle = useCallback((e: { newState?: string }) => {
      setOpen(e.newState === 'open');
    }, []);

    const triggerStyle: CSSProperties = { anchorName } as CSSProperties;
    const listStyle: CSSProperties = { positionAnchor: anchorName } as CSSProperties;

    return (
      <>
        <button
          ref={triggerRef}
          type="button"
          id={triggerId}
          name={name}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
          }
          disabled={disabled}
          data-placeholder={selectedOption ? undefined : ''}
          className={['ms-select', `ms-select--${size}`, open && 'ms-select--open', className]
            .filter(Boolean)
            .join(' ')}
          style={triggerStyle}
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={onTriggerKeyDown}
        >
          <span className="ms-select__value">{selectedOption?.label ?? placeholder}</span>
          <span className="ms-select__arrow" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
              <path
                d="M4 6l4 4 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        <div
          ref={listboxRef}
          id={listboxId}
          popover="auto"
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
          data-open={open ? '' : undefined}
          className={['ms-select__list', `ms-select__list--${size}`].join(' ')}
          style={listStyle}
          onKeyDown={onListKeyDown}
          onToggle={onToggle}
        >
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            const isActive = index === activeIndex;
            return (
              // biome-ignore lint/a11y/useKeyWithClickEvents: 键盘交互在 listbox 容器统一处理(aria-activedescendant 模型);option 仅响应指针
              // biome-ignore lint/a11y/useFocusableInteractive: option 不进 Tab 序;焦点由 listbox 的 aria-activedescendant 表达(WAI-ARIA listbox 模式)
              <div
                key={opt.value}
                id={`${listboxId}-opt-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled || undefined}
                data-active={isActive ? '' : undefined}
                className={[
                  'ms-select__option',
                  isSelected && 'ms-select__option--selected',
                  opt.disabled && 'ms-select__option--disabled',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => !opt.disabled && commit(index)}
                onPointerMove={() => !opt.disabled && setActiveIndex(index)}
              >
                <span className="ms-select__check" aria-hidden="true">
                  <svg
                    viewBox="0 0 16 16"
                    width="14"
                    height="14"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M3.5 8.5l3 3 6-6.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="ms-select__label">{opt.label}</span>
              </div>
            );
          })}
        </div>
      </>
    );
  },
);
Select.displayName = 'Select';
