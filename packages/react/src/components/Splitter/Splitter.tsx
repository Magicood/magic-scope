import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactElement,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  PointerEvent as ReactPointerEvent,
} from 'react';
import {
  Children,
  Fragment,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMessages } from '../../i18n';
import {
  normalizeSizes,
  type PanelConstraint,
  resizePanels,
  resolveLength,
  sizesToPercents,
} from './logic';

export type { PanelConstraint } from './logic';

export type SplitterOrientation = 'horizontal' | 'vertical';

/** 长度可写像素数字或百分比字符串(如 80 / '30%' / '120px')。 */
export type SplitterLength = number | string;

/** Splitter 各部件的细粒度 className 槽位。 */
export interface SplitterClassNames {
  /** 容器根。 */
  root?: string | undefined;
  /** 单个面板。 */
  panel?: string | undefined;
  /** 拖拽分隔条(gutter)。 */
  gutter?: string | undefined;
  /** 分隔条内的把手装饰。 */
  handle?: string | undefined;
}

/** 单次 resize 回调入参:各面板的像素尺寸 + 百分比尺寸。 */
export interface SplitterResizeDetail {
  /** 各面板像素尺寸。 */
  sizes: number[];
  /** 各面板百分比尺寸(占容器主轴)。 */
  percents: number[];
}

interface PanelMeta {
  element: ReactElement<SplitterPanelProps>;
  min?: SplitterLength | undefined;
  max?: SplitterLength | undefined;
  defaultSize?: SplitterLength | undefined;
  collapsible: boolean;
  collapsedSize: number;
}

export interface SplitterPanelProps extends ComponentPropsWithoutRef<'div'> {
  /** 最小尺寸(px 数字或百分比字符串)。默认 0。 */
  min?: SplitterLength | undefined;
  /** 最大尺寸(px 数字或百分比字符串)。默认无界。 */
  max?: SplitterLength | undefined;
  /** 初始尺寸(px 数字或百分比字符串);所有面板都缺省时等分。 */
  defaultSize?: SplitterLength | undefined;
  /** 是否可折叠(双击相邻 gutter 或调用折叠按钮把本面板收起)。默认 false。 */
  collapsible?: boolean | undefined;
  /** 折叠后保留的尺寸(像素),如留一条窄边。默认 0。 */
  collapsedSize?: number | undefined;
}

/**
 * Splitter.Panel —— 分栏中的单个面板。仅承载内容与约束元数据(min/max/defaultSize/collapsible),
 * 真正的尺寸与定位由父 Splitter 统一计算后通过 inline flex-basis 注入,这里是受控的薄壳。
 */
export const SplitterPanel = forwardRef<HTMLDivElement, SplitterPanelProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={['ms-splitter__panel', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  ),
);
SplitterPanel.displayName = 'Splitter.Panel';

function isPanelElement(node: ReactNode): node is ReactElement<SplitterPanelProps> {
  return isValidElement(node) && node.type === SplitterPanel;
}

export interface SplitterProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onResize'> {
  /** 朝向:水平左右分栏 / 垂直上下分栏。默认 horizontal。 */
  orientation?: SplitterOrientation | undefined;
  /** 受控:各面板像素尺寸数组(长度需与面板数一致)。传入即受控,须配 onResize 回写。 */
  sizes?: number[] | undefined;
  /**
   * 拖拽 / 键盘 / 折叠导致尺寸变化时回调(高频)。
   * @param detail 本次变化后各面板的尺寸明细(像素 sizes + 百分比 percents)。
   */
  onResize?: ((detail: SplitterResizeDetail) => void) | undefined;
  /**
   * 落定回调:松手 / 键盘抬起时以最终尺寸触发一次(适合提交持久化)。
   * @param detail 落定时各面板的最终尺寸明细(像素 sizes + 百分比 percents)。
   */
  onResizeEnd?: ((detail: SplitterResizeDetail) => void) | undefined;
  /** 分隔条厚度(像素)。默认 6。 */
  gutterSize?: number | undefined;
  /** 键盘方向键单步位移(像素)。默认 16。 */
  keyboardStep?: number | undefined;
  /** 各部件细粒度 className 槽位。 */
  classNames?: SplitterClassNames | undefined;
  /** 面板(Splitter.Panel)。非 Panel 子节点会被忽略。 */
  children?: ReactNode;
}

/** Splitter 容器对外暴露的命令式句柄。 */
export interface SplitterHandle {
  /** 折叠指定索引的面板(若该面板 collapsible)。 */
  collapse: (panelIndex: number) => void;
  /** 展开指定索引的面板(恢复折叠前尺寸)。 */
  expand: (panelIndex: number) => void;
  /** 当前各面板像素尺寸快照。 */
  getSizes: () => number[];
}

/**
 * Splitter —— 可拖拽分栏(layout,旗舰深度)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 复合:Splitter(容器,负责测量容器主轴、统一计算并以 flex-basis 注入各面板尺寸)+ Splitter.Panel(面板,带 min/max/defaultSize/collapsible 元数据)。
 * 面板间自动渲染可拖拽 gutter(pointer 拖拽把 delta 分摊到两侧,夹 min/max 且总和守恒,纯算法见 logic.ts);
 * 受控(sizes + onResize)与非受控双通道;区分高频 onResize 与落定 onResizeEnd;键盘 ←→/↑↓ 步进、双击折叠。
 * gutter = role="separator" + aria-orientation + aria-valuenow/min/max + aria-label(useMessages "splitter.resize");
 * 折叠过渡尊重 prefers-reduced-motion 与 data-ms-motion='off'。样式见同目录 Splitter.css,需引入 @magic-scope/react/styles.css。
 *
 * 诚实备注:嵌套 Splitter 可用(Panel 内放下一层 Splitter 即可,各层独立测量),
 * 但深层嵌套的「父层拖拽时子层重新测量节流 / 跨层尺寸联动」尚未做,留 TODO(见组件内注释)。
 */
const SplitterBase = forwardRef<SplitterHandle, SplitterProps>(
  (
    {
      orientation = 'horizontal',
      sizes: controlledSizes,
      onResize,
      onResizeEnd,
      gutterSize = 6,
      keyboardStep = 16,
      classNames,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const t = useMessages();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isHorizontal = orientation === 'horizontal';

    // 收集合法 Panel 子节点 + 其约束元数据。
    const panels = useMemo<PanelMeta[]>(() => {
      const out: PanelMeta[] = [];
      Children.forEach(children, (child) => {
        if (isPanelElement(child)) {
          const p = child.props;
          out.push({
            element: child,
            min: p.min,
            max: p.max,
            defaultSize: p.defaultSize,
            collapsible: p.collapsible ?? false,
            collapsedSize: p.collapsedSize ?? 0,
          });
        }
      });
      return out;
    }, [children]);
    const count = panels.length;

    // 容器主轴像素(测量;ResizeObserver 跟随变化)。
    const [containerPx, setContainerPx] = useState(0);
    // 非受控内部尺寸(像素)。受控时不使用。
    const [internalSizes, setInternalSizes] = useState<number[]>([]);
    // 折叠前快照(像素),用于 expand 还原。
    const collapsedFrom = useRef<Map<number, number>>(new Map());

    const isControlled = controlledSizes !== undefined;

    // 把面板约束解析成与「像素尺寸」同单位的 PanelConstraint(随容器尺寸变化)。
    const constraints = useMemo<PanelConstraint[]>(
      () =>
        panels.map((p) => ({
          min: resolveLength(p.min, containerPx),
          max: resolveLength(p.max, containerPx),
          collapsible: p.collapsible,
        })),
      [panels, containerPx],
    );

    // 计算可用于面板的主轴像素(扣掉所有 gutter 占用)。
    const usablePx = Math.max(0, containerPx - gutterSize * Math.max(0, count - 1));

    // 测量容器主轴。ResizeObserver 跟随尺寸变化;环境不支持时退化为仅首测 + window resize。
    useLayoutEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const measure = () => {
        const rect = el.getBoundingClientRect();
        setContainerPx(isHorizontal ? rect.width : rect.height);
      };
      measure();
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
      }
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }, [isHorizontal]);

    // 初始化 / 面板数变化 / 容器尺寸变化时(仅非受控)铺满 usable。
    useEffect(() => {
      if (isControlled || count === 0 || usablePx <= 0) return;
      setInternalSizes((prev) => {
        if (prev.length === count) {
          // 容器变了:在现有比例基础上重新铺满。
          return normalizeSizes(prev, usablePx, constraints);
        }
        // 首次:用 defaultSize(解析为像素)或等分作为种子,再归一铺满。
        const equal = usablePx / count;
        const seed = panels.map((p) => resolveLength(p.defaultSize, containerPx) ?? equal);
        return normalizeSizes(seed, usablePx, constraints);
      });
    }, [isControlled, count, usablePx, panels, containerPx, constraints]);

    // 当前生效尺寸(像素):受控取入参(夹一遍防越界),否则取内部。
    const sizes = useMemo<number[]>(() => {
      if (isControlled) {
        const incoming = controlledSizes ?? [];
        if (incoming.length === count && usablePx > 0) {
          return normalizeSizes(incoming, usablePx, constraints);
        }
        return incoming.slice(0, count);
      }
      return internalSizes;
    }, [isControlled, controlledSizes, internalSizes, count, usablePx, constraints]);

    // 最新尺寸放 ref 供拖拽/落定取终值,避免闭包过期。
    const latest = useRef<number[]>(sizes);
    latest.current = sizes;

    const emit = useCallback(
      (nextSizes: number[], end: boolean) => {
        const detail: SplitterResizeDetail = {
          sizes: nextSizes,
          percents: sizesToPercents(nextSizes, usablePx),
        };
        if (!isControlled) setInternalSizes(nextSizes);
        onResize?.(detail);
        if (end) onResizeEnd?.(detail);
      },
      [isControlled, onResize, onResizeEnd, usablePx],
    );

    // —— 拖拽:在 gutter 上 pointerdown 起,移动按 delta 改两侧 —— //
    const dragRef = useRef<{ gutter: number; startPos: number; startSizes: number[] } | null>(null);
    // 拖拽视觉态:关闭面板过渡(跟手)。只在拖拽边界翻转,不在 move 高频 setState。
    const [dragging, setDragging] = useState(false);

    const onGutterPointerDown = useCallback(
      (gutterIndex: number) => (event: ReactPointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;
        event.preventDefault();
        (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
        dragRef.current = {
          gutter: gutterIndex,
          startPos: isHorizontal ? event.clientX : event.clientY,
          startSizes: [...latest.current],
        };
        setDragging(true);
      },
      [isHorizontal],
    );

    const onGutterPointerMove = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag) return;
        const pos = isHorizontal ? event.clientX : event.clientY;
        const delta = pos - drag.startPos;
        const nextSizes = resizePanels(drag.startSizes, drag.gutter, delta, usablePx, constraints);
        emit(nextSizes, false);
      },
      [isHorizontal, usablePx, constraints, emit],
    );

    const endDrag = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;
        (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
        dragRef.current = null;
        setDragging(false);
        emit([...latest.current], true);
      },
      [emit],
    );

    // —— 键盘:方向键步进调整相邻两块 —— //
    const onGutterKeyDown = useCallback(
      (gutterIndex: number) => (event: ReactKeyboardEvent<HTMLDivElement>) => {
        const key = event.key;
        const stepKeys = isHorizontal
          ? { dec: 'ArrowLeft', inc: 'ArrowRight' }
          : { dec: 'ArrowUp', inc: 'ArrowDown' };
        let delta = 0;
        if (key === stepKeys.inc) delta = keyboardStep;
        else if (key === stepKeys.dec) delta = -keyboardStep;
        else if (key === 'Home')
          delta = -usablePx; // 推到一侧极限(被 min/max 夹住)
        else if (key === 'End') delta = usablePx;
        else return;
        event.preventDefault();
        const nextSizes = resizePanels(
          [...latest.current],
          gutterIndex,
          delta,
          usablePx,
          constraints,
        );
        emit(nextSizes, true);
      },
      [isHorizontal, keyboardStep, usablePx, constraints, emit],
    );

    // —— 折叠 / 展开 —— //
    const collapsePanel = useCallback(
      (panelIndex: number) => {
        const meta = panels[panelIndex];
        if (!meta?.collapsible) return;
        const current = [...latest.current];
        const cur = current[panelIndex];
        if (cur === undefined) return;
        // 把本面板收到 collapsedSize,腾出的空间给相邻 gutter 的另一侧。
        const gutterIndex = panelIndex < count - 1 ? panelIndex : panelIndex - 1;
        const delta = cur - meta.collapsedSize;
        // 折叠时允许突破 min:临时放开本面板下限。
        const relaxed = constraints.map((c, i) =>
          i === panelIndex ? { ...c, min: meta.collapsedSize } : c,
        );
        const signedDelta = gutterIndex === panelIndex ? -delta : delta;
        const nextSizes = resizePanels(current, gutterIndex, signedDelta, usablePx, relaxed);
        collapsedFrom.current.set(panelIndex, cur);
        emit(nextSizes, true);
      },
      [panels, count, constraints, usablePx, emit],
    );

    const expandPanel = useCallback(
      (panelIndex: number) => {
        const meta = panels[panelIndex];
        if (!meta) return;
        const restore = collapsedFrom.current.get(panelIndex);
        const current = [...latest.current];
        const cur = current[panelIndex];
        if (cur === undefined) return;
        const target = restore ?? usablePx / Math.max(1, count);
        const gutterIndex = panelIndex < count - 1 ? panelIndex : panelIndex - 1;
        const delta = target - cur;
        const signedDelta = gutterIndex === panelIndex ? delta : -delta;
        const nextSizes = resizePanels(current, gutterIndex, signedDelta, usablePx, constraints);
        collapsedFrom.current.delete(panelIndex);
        emit(nextSizes, true);
      },
      [panels, count, constraints, usablePx, emit],
    );

    // 双击 gutter:折叠相邻可折叠面板(优先左/上侧)。
    const onGutterDoubleClick = useCallback(
      (gutterIndex: number) => () => {
        const left = panels[gutterIndex];
        const right = panels[gutterIndex + 1];
        if (left?.collapsible) collapsePanel(gutterIndex);
        else if (right?.collapsible) collapsePanel(gutterIndex + 1);
      },
      [panels, collapsePanel],
    );

    useImperativeHandle(
      ref,
      (): SplitterHandle => ({
        collapse: collapsePanel,
        expand: expandPanel,
        getSizes: () => [...latest.current],
      }),
      [collapsePanel, expandPanel],
    );

    const rootClass = ['ms-splitter', `ms-splitter--${orientation}`, classNames?.root, className]
      .filter(Boolean)
      .join(' ');

    const ariaLabel = t('splitter.resize');

    return (
      <div
        ref={containerRef}
        className={rootClass}
        data-orientation={orientation}
        data-dragging={dragging || undefined}
        style={{ ...style, '--ms-splitter-gutter': `${gutterSize}px` } as CSSProperties}
        {...rest}
      >
        {panels.map((meta, index) => {
          const basisPx = sizes[index];
          const panelStyle: CSSProperties = {
            ...(meta.element.props.style as CSSProperties | undefined),
            // 受控/已测量则注入像素 basis;尚未测量时回退 0 + flex-grow 等分,避免首帧塌缩。
            flexBasis: basisPx !== undefined ? `${basisPx}px` : '0%',
            flexGrow: basisPx !== undefined ? 0 : 1,
          };
          const collapsed = basisPx !== undefined && basisPx <= meta.collapsedSize;
          const panelClass = [
            'ms-splitter__panel',
            collapsed && 'ms-splitter__panel--collapsed',
            classNames?.panel,
            meta.element.props.className,
          ]
            .filter(Boolean)
            .join(' ');

          const total = usablePx > 0 ? usablePx : 1;
          const valueNow = basisPx !== undefined ? Math.round((basisPx / total) * 100) : undefined;

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: 面板按位置稳定,索引即身份(无重排语义)
            <Fragment key={index}>
              <div
                className={panelClass}
                style={panelStyle}
                data-collapsed={collapsed || undefined}
                {...filterPanelDomProps(meta.element.props)}
              >
                {meta.element.props.children}
              </div>
              {index < count - 1 && (
                // biome-ignore lint/a11y/useSemanticElements: separator 是可聚焦的拖拽控件,div+role=separator 是 WAI-ARIA 窗格分隔标准
                <div
                  role="separator"
                  tabIndex={0}
                  aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
                  aria-label={ariaLabel}
                  aria-valuenow={valueNow}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className={['ms-splitter__gutter', classNames?.gutter].filter(Boolean).join(' ')}
                  onPointerDown={onGutterPointerDown(index)}
                  onPointerMove={onGutterPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onKeyDown={onGutterKeyDown(index)}
                  onDoubleClick={onGutterDoubleClick(index)}
                >
                  <span
                    className={['ms-splitter__handle', classNames?.handle]
                      .filter(Boolean)
                      .join(' ')}
                    aria-hidden="true"
                  />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    );
  },
);
SplitterBase.displayName = 'Splitter';

// 只把真正的 DOM 透传属性放到面板 div 上(剔除 Splitter.Panel 的元数据 props 与已单独处理的 className/style/children)。
function filterPanelDomProps(
  props: SplitterPanelProps,
): Omit<
  SplitterPanelProps,
  | 'min'
  | 'max'
  | 'defaultSize'
  | 'collapsible'
  | 'collapsedSize'
  | 'className'
  | 'style'
  | 'children'
> {
  const {
    min: _min,
    max: _max,
    defaultSize: _defaultSize,
    collapsible: _collapsible,
    collapsedSize: _collapsedSize,
    className: _className,
    style: _style,
    children: _children,
    ...domProps
  } = props;
  return domProps;
}

/** 复合导出:Splitter.Panel 作为静态属性挂载,支持 <Splitter><Splitter.Panel/></Splitter> 写法。 */
type SplitterComponent = typeof SplitterBase & { Panel: typeof SplitterPanel };
export const Splitter = SplitterBase as SplitterComponent;
Splitter.Panel = SplitterPanel;
