import type { ClipboardEvent, ComponentPropsWithoutRef, KeyboardEvent } from 'react';
import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import {
  compactCells,
  isComplete,
  joinCells,
  type PinInputType,
  sanitize,
  splitCells,
  splitValue,
} from './logic';

export type PinInputSize = 'sm' | 'md' | 'lg';

/** PinInput 子部件细粒度类名槽位。 */
export interface PinInputClassNames {
  /** 外层 group 容器。 */
  root?: string | undefined;
  /** 单个格子(原生 input)。 */
  cell?: string | undefined;
}

export interface PinInputProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue' | 'children' | 'role'> {
  /** 分段格数。默认 6。 */
  length?: number | undefined;
  /** 受控值(整串;长于 length 截断,短于 length 右侧留空)。 */
  value?: string | undefined;
  /** 非受控初始值。 */
  defaultValue?: string | undefined;
  /** 值变化回调,回传当前整串(已按 type 清洗)。 */
  onChange?: ((value: string) => void) | undefined;
  /** 填满全部格子时回调一次,回传完整串。 */
  onComplete?: ((value: string) => void) | undefined;
  /** 收字范围:numeric 仅数字 / alphanumeric 数字+字母。默认 numeric。 */
  type?: PinInputType | undefined;
  /** 掩码显示(密码点),适合敏感口令。 */
  mask?: boolean | undefined;
  /** 禁用全部格子。 */
  disabled?: boolean | undefined;
  /** 校验失败态:染 danger 发光环并设 aria-invalid。 */
  invalid?: boolean | undefined;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: PinInputSize | undefined;
  /** 挂载即聚焦首格。 */
  autoFocus?: boolean | undefined;
  /** 单字符占位符,逐格显示。 */
  placeholder?: string | undefined;
  /** 整组可访问名;默认走 i18n 的 pinInput.label。 */
  'aria-label'?: string | undefined;
  /** 子部件类名留口(root / cell)。 */
  classNames?: PinInputClassNames | undefined;
}

/**
 * PinInput —— OTP/验证码分段输入(深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * length 个单字符格:合法字符自动跳下一格、Backspace 空格回退并清除、粘贴整串自动分填、←→/Home/End 焦点导航;
 * type 控制收字范围(numeric/alphanumeric)、mask 掩码、invalid 染 danger 环;受控/非受控两用。
 * a11y:外层 role=group + aria-label(i18n);每格有「第 N 位」aria-label、aria-invalid。
 * 尊重 prefers-reduced-motion 与 data-ms-motion=off。可抽取逻辑见同目录 logic.ts。
 * 留口:classNames.root / classNames.cell 细粒度槽位;...rest 透传根容器属性与事件(不覆盖用户处理器)。
 * 样式见同目录 PinInput.css,需引入 @magic-scope/react/styles.css。
 */
export const PinInput = forwardRef<HTMLDivElement, PinInputProps>(
  (
    {
      length = 6,
      value: valueProp,
      defaultValue,
      onChange,
      onComplete,
      type = 'numeric',
      mask = false,
      disabled = false,
      invalid = false,
      size = 'md',
      autoFocus = false,
      placeholder,
      className,
      classNames,
      'aria-label': ariaLabel,
      ...rest
    },
    ref,
  ) => {
    const t = useMessages();
    const cellCount = Math.max(0, Math.trunc(length));

    // 受控/非受控:内部态仅在非受控时生效;受控以 valueProp 为准。
    const isControlled = valueProp !== undefined;
    // 非受控内部态是**保留空位**的定长内部串(哨兵占位),绝不折叠左挤。
    const [innerCells, setInnerCells] = useState<string>(() =>
      joinCells(splitValue(sanitize(defaultValue ?? '', type).slice(0, cellCount), cellCount)),
    );
    // cells 是定长、保留空位的真相数组:受控时按父级紧凑串左对齐铺开,非受控时从内部串反序列化。
    const cells = useMemo(
      () =>
        isControlled
          ? splitValue(sanitize(valueProp ?? '', type).slice(0, cellCount), cellCount)
          : splitCells(innerCells, cellCount),
      [isControlled, valueProp, innerCells, type, cellCount],
    );

    // 每格 DOM 引用,用于焦点导航。
    const cellRefs = useRef<Array<HTMLInputElement | null>>([]);

    const focusCell = useCallback((index: number) => {
      const el = cellRefs.current[index];
      if (el) {
        el.focus();
        el.select();
      }
    }, []);

    // onComplete 上升沿:记上一次是否已填满,只在「上次未满→本次满」时触发一次。
    const wasCompleteRef = useRef(isComplete(compactCells(cells), cellCount));

    // 统一提交新的定长 cells:保留空位写内部态;对外回传紧凑串;仅在填满上升沿触发 onComplete。
    const commit = useCallback(
      (nextCells: readonly string[]) => {
        if (!isControlled) {
          setInnerCells(joinCells(nextCells));
        }
        const compact = compactCells(nextCells);
        onChange?.(compact);
        const complete = isComplete(compact, cellCount);
        if (complete && !wasCompleteRef.current) {
          onComplete?.(compact);
        }
        wasCompleteRef.current = complete;
      },
      [isControlled, onChange, onComplete, cellCount],
    );

    // 在某格写入单个字符(覆盖该格,按定长定位、不左挤);非空时焦点推进下一格。
    const setCharAt = useCallback(
      (index: number, char: string) => {
        const nextCells = [...cells];
        nextCells[index] = char;
        commit(nextCells);
        if (char !== '' && index < cellCount - 1) {
          focusCell(index + 1);
        }
      },
      [cells, commit, cellCount, focusCell],
    );

    const handleCellChange = useCallback(
      (index: number, raw: string) => {
        // input 事件可能带多字符(IME/快速输入/移动端自动填充):清洗后从本格起顺次铺开。
        const clean = sanitize(raw, type);
        if (clean === '') {
          // 非法输入:受控下需把 DOM 回写为本格原值以纠正。
          const el = cellRefs.current[index];
          if (el) {
            el.value = cells[index] ?? '';
          }
          return;
        }
        const nextCells = [...cells];
        let cursor = index;
        for (const ch of clean) {
          if (cursor >= cellCount) {
            break;
          }
          nextCells[cursor] = ch;
          cursor += 1;
        }
        commit(nextCells);
        focusCell(Math.min(cursor, cellCount - 1));
      },
      [cells, commit, type, cellCount, focusCell],
    );

    const handleKeyDown = useCallback(
      (index: number, event: KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
          case 'Backspace': {
            event.preventDefault();
            if ((cells[index] ?? '') !== '') {
              // 本格有字符:清本格,焦点留本格。
              setCharAt(index, '');
              focusCell(index);
            } else if (index > 0) {
              // 本格空:回退到上一格并清除其字符。
              const nextCells = [...cells];
              nextCells[index - 1] = '';
              commit(nextCells);
              focusCell(index - 1);
            }
            break;
          }
          case 'Delete': {
            event.preventDefault();
            setCharAt(index, '');
            focusCell(index);
            break;
          }
          case 'ArrowLeft': {
            event.preventDefault();
            if (index > 0) {
              focusCell(index - 1);
            }
            break;
          }
          case 'ArrowRight': {
            event.preventDefault();
            if (index < cellCount - 1) {
              focusCell(index + 1);
            }
            break;
          }
          case 'Home': {
            event.preventDefault();
            focusCell(0);
            break;
          }
          case 'End': {
            event.preventDefault();
            focusCell(cellCount - 1);
            break;
          }
          default:
            break;
        }
      },
      [cells, commit, setCharAt, cellCount, focusCell],
    );

    const handlePaste = useCallback(
      (index: number, event: ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        const pasted = sanitize(event.clipboardData.getData('text'), type);
        if (pasted === '') {
          return;
        }
        const nextCells = [...cells];
        let cursor = index;
        for (const ch of pasted) {
          if (cursor >= cellCount) {
            break;
          }
          nextCells[cursor] = ch;
          cursor += 1;
        }
        commit(nextCells);
        focusCell(Math.min(cursor, cellCount - 1));
      },
      [cells, commit, type, cellCount, focusCell],
    );

    const handleFocus = useCallback((index: number) => {
      // 聚焦即选中本格内容,键入直接覆盖,符合 OTP 直觉。
      cellRefs.current[index]?.select();
    }, []);

    const groupLabel = ariaLabel ?? t('pinInput.label');
    const inputMode = type === 'numeric' ? 'numeric' : 'text';

    const rootClasses = [
      'ms-pin-input',
      `ms-pin-input--${size}`,
      // 始终挂 danger 槽位,invalid 时由样式启用,保证 --ms-c-glow 等可读
      'ms-tone-danger',
      invalid && 'ms-pin-input--invalid',
      disabled && 'ms-pin-input--disabled',
      className,
      classNames?.root,
    ]
      .filter(Boolean)
      .join(' ');

    const cellBaseClass = ['ms-pin-input__cell', classNames?.cell].filter(Boolean).join(' ');

    return (
      // biome-ignore lint/a11y/useSemanticElements: OTP 分段输入是一组关联控件,role="group" + aria-label 是正确的 ARIA 语义
      <div
        ref={ref}
        role="group"
        aria-label={groupLabel}
        aria-disabled={disabled || undefined}
        className={rootClasses}
        {...rest}
      >
        {cells.map((char, index) => {
          // 位置固定、不重排,index 作 key 安全。
          const cellKey = `cell-${index}`;
          const cellLabel = `${groupLabel} 第 ${index + 1} 位`;
          return (
            <input
              key={cellKey}
              ref={(node: HTMLInputElement | null) => {
                cellRefs.current[index] = node;
              }}
              className={cellBaseClass}
              type={mask ? 'password' : 'text'}
              inputMode={inputMode}
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              // biome-ignore lint/a11y/noAutofocus: OTP 场景常需挂载即聚焦,由 autoFocus prop 显式开启
              autoFocus={autoFocus && index === 0}
              disabled={disabled}
              aria-invalid={invalid || undefined}
              aria-label={cellLabel}
              placeholder={placeholder}
              value={char}
              maxLength={1}
              onChange={composeEventHandlers(undefined, (event) =>
                handleCellChange(index, event.target.value),
              )}
              onKeyDown={composeEventHandlers(undefined, (event) => handleKeyDown(index, event))}
              onPaste={composeEventHandlers(undefined, (event) => handlePaste(index, event))}
              onFocus={composeEventHandlers(undefined, () => handleFocus(index))}
            />
          );
        })}
      </div>
    );
  },
);
PinInput.displayName = 'PinInput';
