import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { Popover, type PopoverPlacement } from '../Popover';
import {
  type ColorFormat,
  clamp,
  formatColor,
  type HSVA,
  hsvaEquals,
  hsvToRgb,
  parseColor,
  rgbToHex,
} from './logic';

export type { ColorFormat, HSVA } from './logic';

export type ColorPickerSize = 'sm' | 'md' | 'lg';

/** 各部件的细粒度 className 槽位。 */
export interface ColorPickerClassNames {
  /** 触发色块按钮。 */
  trigger?: string | undefined;
  /** 浮层面板根。 */
  panel?: string | undefined;
  /** 2D 饱和度-明度面板。 */
  area?: string | undefined;
  /** hue 滑条。 */
  hue?: string | undefined;
  /** alpha 滑条。 */
  alpha?: string | undefined;
  /** 预览块。 */
  preview?: string | undefined;
  /** 格式文本输入。 */
  input?: string | undefined;
  /** 预设色板。 */
  presets?: string | undefined;
}

/** 触发色块按钮可透传的原生属性(排除被内部接管的键)。 */
type ColorPickerRootProps = Omit<
  ComponentPropsWithoutRef<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'children' | 'className' | 'style' | 'type'
>;

export interface ColorPickerProps extends ColorPickerRootProps {
  /** 受控值(颜色串,吃 #hex / #hexa / rgb() / rgba() / hsl() / hsla())。传入即受控。 */
  value?: string | undefined;
  /** 非受控初始值。缺省 #ff0000。 */
  defaultValue?: string | undefined;
  /**
   * 值变化回调,入参为按当前 format 格式化的颜色串。
   * @param value 按当前 format 格式化后的颜色串(全不透明时为简洁形式,带透明度时升 8 位 hex / rgba / hsla)。
   */
  onChange?: ((value: string) => void) | undefined;
  /** 输出格式:hex / rgb / hsl;同时决定文本输入框的格式与默认切换。默认 hex。 */
  format?: ColorFormat | undefined;
  /** 是否暴露 alpha 滑条(关掉则颜色恒不透明,输出不带 alpha 通道)。默认 true。 */
  alpha?: boolean | undefined;
  /** 预设色板(颜色串数组);点击即选中。 */
  presets?: readonly string[] | undefined;
  /** 是否允许切换 hex/rgb/hsl 格式(显示格式切换器;受控 format 时自动隐藏)。默认 true。 */
  formatSwitcher?: boolean | undefined;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: ColorPickerSize | undefined;
  /** 禁用。 */
  disabled?: boolean | undefined;
  /** 浮层方位(12 向),透传 Popover。默认 bottom-start。 */
  placement?: PopoverPlacement | undefined;
  /** 受控浮层开合。 */
  open?: boolean | undefined;
  /**
   * 浮层开合变化回调。
   * @param open 浮层变化后的开合状态(true 为打开,false 为关闭)。
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** 触发色块按钮 aria-label(无可见文字标签时务必给;缺省用当前颜色串)。 */
  'aria-label'?: string | undefined;
  /** 触发色块按钮附加 className。 */
  className?: string | undefined;
  /** 各部件细粒度 className 槽位。 */
  classNames?: ColorPickerClassNames | undefined;
}

/** EyeDropper 仍是较新 API,DOM lib 未必带类型,这里最窄声明以做特性检测。 */
interface EyeDropperLike {
  open: (options?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }>;
}
type EyeDropperCtor = new () => EyeDropperLike;

const FORMATS: readonly ColorFormat[] = ['hex', 'rgb', 'hsl'];

/** 当前 hue 的纯色(s=v=1),给 2D 面板底色用。 */
function hueHex(h: number): string {
  const { r, g, b } = hsvToRgb(h, 1, 1);
  return rgbToHex(r, g, b);
}

/**
 * ColorPicker —— 颜色选择器(forms,旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 真相源为内部 HSVA(色彩数学全在同目录 logic.ts 的纯函数,可平移 core):
 * - ① 饱和度-明度 2D 面板:pointer 拖拽选 s/v,thumb 叠在「当前 hue 为底」的双向渐变上,方向键微调;
 * - ② hue 横向滑条(role=slider,aria-label 用 colorPicker.hue);
 * - ③ alpha 滑条(可选,棋盘格底,aria-label colorPicker.alpha);
 * - ④ 格式文本输入 + hex/rgb/hsl 切换;⑤ presets 预设色板;
 * - ⑥ 取色器按钮(window.EyeDropper 特性检测,无则不显示);⑦ 预览块。
 * trigger 为色块按钮 + 复用 Popover 包裹面板。value(串)/defaultValue/onChange(串)受控/非受控双通道。
 * a11y:面板与滑条均有 role/aria、键盘可达;尊重 prefers-reduced-motion 与 [data-ms-motion='off']。
 * 样式见同目录 ColorPicker.css,需引入 @magic-scope/react/styles.css。
 *
 * 兼容性诚实备注:
 * - EyeDropper(屏幕取色)目前仅 Chromium 系(Chrome/Edge 95+)支持,Firefox/Safari 不支持 ——
 *   组件做特性检测,不支持时**不渲染**取色器按钮(不报错也不占位)。
 * - alpha 串:hex 走 8 位 #RRGGBBAA,在很旧的浏览器里 CSS 不认;如需最大兼容把 format 设 rgb/hsl。
 */
export const ColorPicker = forwardRef<HTMLButtonElement, ColorPickerProps>(
  (
    {
      value: controlledValue,
      defaultValue = '#ff0000',
      onChange,
      format: controlledFormat,
      alpha: alphaEnabled = true,
      presets,
      formatSwitcher = true,
      size = 'md',
      disabled = false,
      placement = 'bottom-start',
      open,
      onOpenChange,
      'aria-label': ariaLabel,
      className,
      classNames,
      ...rest
    },
    ref,
  ) => {
    const t = useMessages();

    // —— 真相源:HSVA。非受控存在 internal;受控时每渲染按 value 串解析,失败保留上次有效值 ——
    const [internal, setInternal] = useState<HSVA>(
      () => parseColor(controlledValue ?? defaultValue) ?? { h: 0, s: 1, v: 1, a: 1 },
    );
    const isControlled = controlledValue !== undefined;
    const lastValidRef = useRef<HSVA>(internal);
    const hsva = useMemo<HSVA>(() => {
      if (!isControlled) return internal;
      const parsed = parseColor(controlledValue ?? '');
      if (!parsed) return lastValidRef.current;
      // RGB→HSV 对无彩色不可逆:灰阶(s===0)丢色相、纯黑(v===0)丢色相+饱和度,
      // 解析都会归 0。受控下每渲染重解析,会把父组件存的 #000000/#ffffff 串往返后
      // 误将色相砸成红(0)。这里沿用上次有效 h/s 作基准,保住用户当前色相。
      const prev = lastValidRef.current;
      if (parsed.v === 0) return { ...parsed, h: prev.h, s: prev.s };
      if (parsed.s === 0) return { ...parsed, h: prev.h };
      return parsed;
    }, [isControlled, controlledValue, internal]);
    lastValidRef.current = hsva;

    // —— 格式:受控 format 优先,否则本地可切换 ——
    const [internalFormat, setInternalFormat] = useState<ColorFormat>(controlledFormat ?? 'hex');
    const formatMode = controlledFormat ?? internalFormat;

    // alpha 关闭:对外恒不透明,展示与输出都不带 alpha 通道。
    const effective = useMemo<HSVA>(
      () => (alphaEnabled ? hsva : { ...hsva, a: 1 }),
      [alphaEnabled, hsva],
    );

    const emit = useCallback(
      (next: HSVA) => {
        const normalized = alphaEnabled ? next : { ...next, a: 1 };
        if (!isControlled) setInternal(normalized);
        lastValidRef.current = normalized;
        // withAlpha 不强制:由 formatColor 按 a<1 决定是否带 alpha 通道 ——
        // 全不透明时输出简洁的 #rrggbb / rgb() / hsl(),透明时才升 8 位 hex / rgba / hsla。
        onChange?.(formatColor(normalized, formatMode));
      },
      [isControlled, onChange, formatMode, alphaEnabled],
    );

    const setHsva = useCallback(
      (patch: Partial<HSVA>) => {
        emit({ ...lastValidRef.current, ...patch });
      },
      [emit],
    );

    // —— 2D 面板:pointer 拖拽 + 键盘 ——
    const areaRef = useRef<HTMLDivElement | null>(null);
    const draggingRef = useRef(false);

    const updateFromPoint = useCallback(
      (clientX: number, clientY: number) => {
        const el = areaRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const s = clamp((clientX - rect.left) / rect.width, 0, 1);
        const v = 1 - clamp((clientY - rect.top) / rect.height, 0, 1);
        setHsva({ s, v });
      },
      [setHsva],
    );

    const handleAreaPointerDown = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        event.preventDefault();
        draggingRef.current = true;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        updateFromPoint(event.clientX, event.clientY);
      },
      [disabled, updateFromPoint],
    );

    const handleAreaPointerMove = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!draggingRef.current) return;
        updateFromPoint(event.clientX, event.clientY);
      },
      [updateFromPoint],
    );

    const handleAreaPointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
      draggingRef.current = false;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }, []);

    const handleAreaKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        const step = event.shiftKey ? 0.1 : 0.01;
        const cur = lastValidRef.current;
        let handled = true;
        switch (event.key) {
          case 'ArrowLeft':
            setHsva({ s: clamp(cur.s - step, 0, 1) });
            break;
          case 'ArrowRight':
            setHsva({ s: clamp(cur.s + step, 0, 1) });
            break;
          case 'ArrowUp':
            setHsva({ v: clamp(cur.v + step, 0, 1) });
            break;
          case 'ArrowDown':
            setHsva({ v: clamp(cur.v - step, 0, 1) });
            break;
          case 'Home':
            setHsva({ s: 0 });
            break;
          case 'End':
            setHsva({ s: 1 });
            break;
          default:
            handled = false;
        }
        if (handled) event.preventDefault();
      },
      [disabled, setHsva],
    );

    // —— hue 滑条:抽出公共「按 X 取 0–360」逻辑 ——
    const setHueFromX = useCallback(
      (clientX: number, el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0) return;
        setHsva({ h: clamp((clientX - rect.left) / rect.width, 0, 1) * 360 });
      },
      [setHsva],
    );

    const setAlphaFromX = useCallback(
      (clientX: number, el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0) return;
        setHsva({ a: clamp((clientX - rect.left) / rect.width, 0, 1) });
      },
      [setHsva],
    );

    // —— 文本输入:本地 buffer,失焦/回车提交;非法不写回(还原)——
    const [inputBuffer, setInputBuffer] = useState<string | null>(null);
    const displayString = formatColor(effective, formatMode);
    const inputValue = inputBuffer ?? displayString;

    const commitInput = useCallback(() => {
      if (inputBuffer === null) return;
      const parsed = parseColor(inputBuffer);
      if (parsed) emit(alphaEnabled ? parsed : { ...parsed, a: 1 });
      setInputBuffer(null);
    }, [inputBuffer, emit, alphaEnabled]);

    // 展示串 / 格式变化时丢弃未提交 buffer(避免显示与状态错位)。
    // biome-ignore lint/correctness/useExhaustiveDependencies: 仅在 display/format 变化时重置,故意不依赖 inputBuffer
    useEffect(() => {
      setInputBuffer(null);
    }, [displayString, formatMode]);

    // —— EyeDropper 特性检测(SSR 安全)——
    const supportsEyeDropper =
      typeof window !== 'undefined' &&
      typeof (window as { EyeDropper?: unknown }).EyeDropper === 'function';

    const pickFromScreen = useCallback(() => {
      if (disabled) return;
      const Ctor = (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper;
      if (!Ctor) return;
      new Ctor()
        .open()
        .then((result) => {
          const parsed = parseColor(result.sRGBHex);
          if (parsed) emit(alphaEnabled ? { ...parsed, a: lastValidRef.current.a } : parsed);
        })
        .catch(() => {
          // 用户取消(AbortError)或不支持:静默忽略。
        });
    }, [disabled, emit, alphaEnabled]);

    // —— 派生展示值 ——
    const { r, g, b } = hsvToRgb(effective.h, effective.s, effective.v);
    const swatchColor = alphaEnabled
      ? `rgba(${r}, ${g}, ${b}, ${effective.a})`
      : `rgb(${r}, ${g}, ${b})`;
    const solidColor = `rgb(${r}, ${g}, ${b})`;
    const areaBg = hueHex(effective.h);

    const sPct = `${clamp(effective.s, 0, 1) * 100}%`;
    const vPct = `${(1 - clamp(effective.v, 0, 1)) * 100}%`;
    const huePct = `${(clamp(effective.h, 0, 360) / 360) * 100}%`;
    const aPct = `${clamp(effective.a, 0, 1) * 100}%`;

    // —— trigger 色块按钮 ——
    const triggerClass = ['ms-color-picker__trigger', classNames?.trigger]
      .filter(Boolean)
      .join(' ');
    const trigger = (
      <button
        ref={ref}
        type="button"
        className={triggerClass}
        disabled={disabled}
        aria-label={ariaLabel ?? displayString}
        data-ms-size={size}
        {...rest}
      >
        <span
          className="ms-color-picker__trigger-swatch"
          style={{ '--ms-cp-swatch': swatchColor } as CSSProperties}
          aria-hidden="true"
        />
      </button>
    );

    const rootClass = ['ms-color-picker', `ms-color-picker--${size}`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <Popover
        trigger={trigger}
        placement={placement}
        triggerAction="click"
        tone="neutral"
        {...(open !== undefined ? { open } : {})}
        {...(onOpenChange ? { onOpenChange } : {})}
        {...(classNames?.panel ? { classNames: { panel: classNames.panel } } : {})}
        className={rootClass}
      >
        <div className="ms-color-picker__panel" data-ms-size={size}>
          {/* ① 饱和度-明度 2D 面板(自定义二维 slider,无原生等价元素) */}
          <div
            ref={areaRef}
            className={['ms-color-picker__area', classNames?.area].filter(Boolean).join(' ')}
            style={{ '--ms-cp-area-bg': areaBg } as CSSProperties}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={`${t('colorPicker.hue')} S/V`}
            // 2D 面板无法用单一 valuenow 表达 s+v:以饱和度(0–100)作主轴数值,
            // 完整色值由 aria-valuetext 朗读(s/v 的明度由方向键上下调,SR 读到颜色串变化)。
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(effective.s * 100)}
            aria-valuetext={displayString}
            aria-disabled={disabled || undefined}
            onPointerDown={handleAreaPointerDown}
            onPointerMove={handleAreaPointerMove}
            onPointerUp={handleAreaPointerUp}
            onPointerCancel={handleAreaPointerUp}
            onKeyDown={handleAreaKeyDown}
          >
            <span className="ms-color-picker__area-sat" aria-hidden="true" />
            <span className="ms-color-picker__area-val" aria-hidden="true" />
            <span
              className="ms-color-picker__area-thumb"
              style={
                {
                  insetInlineStart: sPct,
                  insetBlockStart: vPct,
                  '--ms-cp-thumb': solidColor,
                } as CSSProperties
              }
              aria-hidden="true"
            />
          </div>

          <div className="ms-color-picker__sliders">
            {/* ⑦ 预览块 */}
            <span
              className={['ms-color-picker__preview', classNames?.preview]
                .filter(Boolean)
                .join(' ')}
              style={{ '--ms-cp-swatch': swatchColor } as CSSProperties}
              aria-hidden="true"
            />

            <div className="ms-color-picker__rails">
              {/* ② hue 滑条(渐变色谱轨道,自绘以承载 hue 全色相) */}
              <div
                className={['ms-color-picker__hue', classNames?.hue].filter(Boolean).join(' ')}
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-label={t('colorPicker.hue')}
                aria-valuemin={0}
                aria-valuemax={360}
                aria-valuenow={Math.round(effective.h)}
                aria-disabled={disabled || undefined}
                onPointerDown={(e) => {
                  if (disabled) return;
                  e.preventDefault();
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                  e.currentTarget.dataset.dragging = 'hue';
                  setHueFromX(e.clientX, e.currentTarget);
                }}
                onPointerMove={(e) => {
                  if (e.currentTarget.dataset.dragging === 'hue')
                    setHueFromX(e.clientX, e.currentTarget);
                }}
                onPointerUp={(e) => {
                  delete e.currentTarget.dataset.dragging;
                  e.currentTarget.releasePointerCapture?.(e.pointerId);
                }}
                onKeyDown={(e) => {
                  if (disabled) return;
                  const cur = lastValidRef.current.h;
                  const stepH = e.shiftKey ? 10 : 1;
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHsva({ h: (cur - stepH + 360) % 360 });
                  } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHsva({ h: (cur + stepH) % 360 });
                  } else if (e.key === 'Home') {
                    e.preventDefault();
                    setHsva({ h: 0 });
                  } else if (e.key === 'End') {
                    e.preventDefault();
                    // hue 是环形,360≡0;内部 h 统一规整到 [0,360),End 存 0 而非 360,
                    // 与显示(normalizeHue→0=红)/ aria-valuenow / 渲染三者一致,
                    // 消除 360 处 ArrowRight 跳到 1 的跳变。
                    setHsva({ h: 0 });
                  }
                }}
              >
                <span
                  className="ms-color-picker__hue-thumb"
                  style={{ insetInlineStart: huePct } as CSSProperties}
                  aria-hidden="true"
                />
              </div>

              {/* ③ alpha 滑条(可选,棋盘格底;渐变 + 棋盘格轨道,自绘) */}
              {alphaEnabled && (
                <div
                  className={['ms-color-picker__alpha', classNames?.alpha]
                    .filter(Boolean)
                    .join(' ')}
                  role="slider"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={t('colorPicker.alpha')}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(effective.a * 100)}
                  aria-disabled={disabled || undefined}
                  style={{ '--ms-cp-solid': solidColor } as CSSProperties}
                  onPointerDown={(e) => {
                    if (disabled) return;
                    e.preventDefault();
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                    e.currentTarget.dataset.dragging = 'alpha';
                    setAlphaFromX(e.clientX, e.currentTarget);
                  }}
                  onPointerMove={(e) => {
                    if (e.currentTarget.dataset.dragging === 'alpha')
                      setAlphaFromX(e.clientX, e.currentTarget);
                  }}
                  onPointerUp={(e) => {
                    delete e.currentTarget.dataset.dragging;
                    e.currentTarget.releasePointerCapture?.(e.pointerId);
                  }}
                  onKeyDown={(e) => {
                    if (disabled) return;
                    const cur = lastValidRef.current.a;
                    const stepA = e.shiftKey ? 0.1 : 0.01;
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                      e.preventDefault();
                      setHsva({ a: clamp(cur - stepA, 0, 1) });
                    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                      e.preventDefault();
                      setHsva({ a: clamp(cur + stepA, 0, 1) });
                    } else if (e.key === 'Home') {
                      e.preventDefault();
                      setHsva({ a: 0 });
                    } else if (e.key === 'End') {
                      e.preventDefault();
                      setHsva({ a: 1 });
                    }
                  }}
                >
                  <span
                    className="ms-color-picker__alpha-thumb"
                    style={{ insetInlineStart: aPct } as CSSProperties}
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>

            {/* ⑥ 取色器(仅支持时渲染) */}
            {supportsEyeDropper && (
              <button
                type="button"
                className="ms-color-picker__eyedropper"
                disabled={disabled}
                onClick={pickFromScreen}
                aria-label="EyeDropper"
                title="EyeDropper"
              >
                <span aria-hidden="true">🎯</span>
              </button>
            )}
          </div>

          {/* ④ 格式文本输入 + 切换 */}
          <div className="ms-color-picker__field">
            {formatSwitcher && controlledFormat === undefined && (
              // biome-ignore lint/a11y/useSemanticElements: 格式切换是一组互斥按钮,role=group 承载
              <div className="ms-color-picker__format" role="group" aria-label="format">
                {FORMATS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={[
                      'ms-color-picker__format-btn',
                      f === formatMode && 'ms-color-picker__format-btn--active',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-pressed={f === formatMode}
                    disabled={disabled}
                    onClick={() => setInternalFormat(f)}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
            <input
              type="text"
              className={['ms-color-picker__input', classNames?.input].filter(Boolean).join(' ')}
              value={inputValue}
              disabled={disabled}
              spellCheck={false}
              autoComplete="off"
              aria-label={`${formatMode.toUpperCase()} value`}
              onChange={(e) => setInputBuffer(e.target.value)}
              onBlur={composeEventHandlers(undefined, commitInput)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitInput();
                }
              }}
            />
          </div>

          {/* ⑤ presets 预设色板 */}
          {presets && presets.length > 0 && (
            // biome-ignore lint/a11y/useSemanticElements: 预设色板是一组色块按钮,role=group 承载
            <div
              className={['ms-color-picker__presets', classNames?.presets]
                .filter(Boolean)
                .join(' ')}
              role="group"
              aria-label="presets"
            >
              {presets.map((preset, i) => {
                const parsed = parseColor(preset);
                let css = preset;
                if (parsed) {
                  const c = hsvToRgb(parsed.h, parsed.s, parsed.v);
                  css = `rgba(${c.r}, ${c.g}, ${c.b}, ${parsed.a})`;
                }
                const isActive = parsed ? hsvaEquals(parsed, effective) : false;
                return (
                  <button
                    // 预设是只读静态色板(props,不增删/不重排),串本身可能重复,
                    // 故用「串+索引」保证 key 唯一;静态列表用索引安全。
                    // biome-ignore lint/suspicious/noArrayIndexKey: presets 为静态只读色板,索引稳定
                    key={`${preset}-${i}`}
                    type="button"
                    className={[
                      'ms-color-picker__preset',
                      isActive && 'ms-color-picker__preset--active',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ '--ms-cp-swatch': css } as CSSProperties}
                    disabled={disabled || !parsed}
                    aria-label={preset}
                    aria-pressed={isActive}
                    onClick={() => {
                      if (parsed) emit(alphaEnabled ? parsed : { ...parsed, a: 1 });
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </Popover>
    );
  },
);
ColorPicker.displayName = 'ColorPicker';
