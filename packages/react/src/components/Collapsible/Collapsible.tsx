import type {
  ComponentPropsWithoutRef,
  ForwardRefExoticComponent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  RefAttributes,
} from 'react';
import { createContext, forwardRef, useCallback, useContext, useId, useState } from 'react';
import { composeEventHandlers } from '../../utils/compose';
import { computeToggle, resolveOpen } from './logic';

export type CollapsibleTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

interface CollapsibleContextValue {
  /** 当前是否展开。 */
  open: boolean;
  /** 整体是否禁用(trigger 不可点、不可聚焦)。 */
  disabled: boolean;
  /** content 区的 id(供 trigger aria-controls 关联)。 */
  contentId: string;
  /** trigger 的 id(供 content aria-labelledby 关联)。 */
  triggerId: string;
  /** 切换开合(受控/非受控双通道核心)。 */
  toggle: () => void;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

/** 子部件在 <Collapsible> 之外渲染时给出清晰报错(而非静默 null 解构崩溃)。 */
function useCollapsibleContext(component: string): CollapsibleContextValue {
  const ctx = useContext(CollapsibleContext);
  if (ctx === null) {
    throw new Error(`<Collapsible.${component}> 必须渲染在 <Collapsible> 内部。`);
  }
  return ctx;
}

export interface CollapsibleProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  /** 受控:是否展开。传入即进入受控模式(配合 onOpenChange)。 */
  open?: boolean | undefined;
  /** 非受控初始展开态。默认 false。 */
  defaultOpen?: boolean | undefined;
  /** 整体禁用:trigger 不可点击、不可聚焦,且不响应键盘切换。 */
  disabled?: boolean | undefined;
  /**
   * 历史兼容保留:Content 现在**始终常驻挂载**(对齐 Accordion,见组件 JSDoc),收起态靠 CSS visibility + inert 隐藏,
   * 故本属性已无实际开关作用(收起内容恒在 DOM,SEO 可抓 / 锚点可跳 / 双向动画完整 / 子树 state 不丢)。
   * 保留仅为不破坏既有 API;后续若引入 SSR 懒挂载等能力再复用此口。默认 false。
   *
   * @deprecated Content 始终挂载,本属性已无效果,无需再传。
   */
  forceMount?: boolean | undefined;
  /** 语义色调:根加 ms-tone-${tone},trigger hover/open/focus 配色读 6 槽位。默认 primary。 */
  tone?: CollapsibleTone | undefined;
  /**
   * 展开/收起变化回调(受控 / 非受控均触发)。
   * @param open 变化后的目标展开态:true 为展开,false 为收起。
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
}

interface CollapsibleComponent
  extends ForwardRefExoticComponent<CollapsibleProps & RefAttributes<HTMLDivElement>> {
  Trigger: typeof CollapsibleTrigger;
  Content: typeof CollapsibleContent;
}

/**
 * Collapsible —— 单项折叠原语(Radix 风,旗舰深度)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 复合结构:`Collapsible`(根,管开合状态)+ `Collapsible.Trigger`(切换按钮)+ `Collapsible.Content`(可折叠区)。
 * 与 Accordion 区别:这是「单个开合原语」,无 single/multiple 互斥分组,适合做自定义展开块的地基。
 *
 * 深度:
 * - 受控(open + onOpenChange)/ 非受控(defaultOpen)双通道;disabled 整体禁用;forceMount 收起仍挂载(SEO/动画/锚点)。
 * - tone 色调系统:根 ms-tone-${tone},trigger hover/open/focus 读 6 槽位(--ms-c / --ms-c-hover / --ms-c-glow…)。
 * - 留口:根/子部件均 extends 原生元素透传 ...rest(原生事件 / data-* / aria-*);事件用 composeEventHandlers 不丢用户处理器。
 *
 * 可达性 / 动效:
 * - Content 用 grid-template-rows 0fr→1fr 过渡撑高 + 内容淡入。**Content 始终挂载在 DOM**(对齐 Accordion),
 *   靠 data-state(open/closed)切换网格行高 + CSS visibility 延迟过渡播放双向动画,靠 inert={!open} 对交互 / 读屏隐藏。
 *   常驻挂载保证:展开 / 收起两个方向动画都完整播放,且收起时不销毁 Content 子树(子组件 state / 输入值 / 滚动 / 焦点全部保留),SEO 可抓。
 * - Trigger 原生 <button> + aria-expanded / aria-controls;Content role="region" + aria-labelledby + id。
 * - 键盘:Trigger 为原生 button,Enter / Space 默认即切换。reduced-motion 与 [data-ms-motion=off] 把高度过渡降级为瞬时。
 * 样式见同目录 Collapsible.css,需引入 @magic-scope/react/styles.css。
 */
const CollapsibleRoot = forwardRef<HTMLDivElement, CollapsibleProps>(
  (
    {
      open: controlledOpen,
      defaultOpen = false,
      disabled = false,
      // forceMount 已废弃(Content 始终常驻挂载);仍解构以从 ...rest 剥离,避免透传成非法 DOM 属性。
      forceMount: _forceMount = false,
      tone = 'primary',
      onOpenChange,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const reactId = useId();
    // CSS / DOM id 不便含冒号,useId 产物里把 ':' 换成 '-'。
    const baseId = `ms-collapsible-${reactId.replace(/:/g, '-')}`;
    const triggerId = `${baseId}-trigger`;
    const contentId = `${baseId}-content`;

    const isControlled = controlledOpen !== undefined;
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const open = resolveOpen(controlledOpen, internalOpen);

    const toggle = useCallback(() => {
      const { next, changed } = computeToggle(open, disabled);
      if (!changed) {
        return;
      }
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    }, [open, disabled, isControlled, onOpenChange]);

    const rootClassName = [
      'ms-collapsible',
      `ms-tone-${tone}`,
      open && 'ms-collapsible--open',
      disabled && 'ms-collapsible--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const ctx: CollapsibleContextValue = {
      open,
      disabled,
      contentId,
      triggerId,
      toggle,
    };

    return (
      <div
        ref={ref}
        className={rootClassName}
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        {...rest}
      >
        <CollapsibleContext.Provider value={ctx}>{children}</CollapsibleContext.Provider>
      </div>
    );
  },
);
CollapsibleRoot.displayName = 'Collapsible';

export interface CollapsibleTriggerProps extends ComponentPropsWithoutRef<'button'> {
  /**
   * 点击切换前触发(在内部 toggle 之前调用);在回调内 preventDefault 可阻断内部切换。
   * @param event 该次点击的原生鼠标事件。
   */
  onClick?: ((event: ReactMouseEvent<HTMLButtonElement>) => void) | undefined;
  /**
   * 键盘事件外抛/可拦截(原生 button 已处理 Enter/Space,此处仅用于自定义键)。
   * @param event 触发按钮的原生键盘事件。
   */
  onKeyDown?: ((event: ReactKeyboardEvent<HTMLButtonElement>) => void) | undefined;
}

/**
 * Collapsible.Trigger —— 切换按钮。原生 <button>:Enter / Space 默认即切换,无需手写键盘逻辑。
 * 携带 aria-expanded(反映 open)/ aria-controls(指向 Content)/ disabled(随根)。事件 compose 不丢用户处理器。
 */
export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ className, onClick, type = 'button', disabled: ownDisabled, ...rest }, ref) => {
    const { open, disabled, contentId, triggerId, toggle } = useCollapsibleContext('Trigger');
    const isDisabled = disabled || ownDisabled;

    const handleClick = composeEventHandlers(onClick, (event) => {
      if (!event.defaultPrevented) {
        toggle();
      }
    });

    return (
      <button
        ref={ref}
        type={type}
        id={triggerId}
        className={['ms-collapsible__trigger', className].filter(Boolean).join(' ')}
        aria-expanded={open}
        aria-controls={contentId}
        disabled={isDisabled}
        data-state={open ? 'open' : 'closed'}
        onClick={handleClick}
        {...rest}
      />
    );
  },
);
CollapsibleTrigger.displayName = 'Collapsible.Trigger';

export interface CollapsibleContentProps extends ComponentPropsWithoutRef<'section'> {
  /**
   * 历史兼容保留:Content 已**始终常驻挂载**(见根 forceMount 说明),本属性不再影响是否渲染。
   * 保留仅为不破坏既有实例级 API。默认继承根设置。
   *
   * @deprecated Content 始终挂载,本属性已无效果。
   */
  forceMount?: boolean | undefined;
}

/**
 * Collapsible.Content —— 可折叠区。grid-template-rows 0fr↔1fr 平滑撑高 + 内容淡入;
 * 渲染原生 <section>(命名地标区域)+ aria-labelledby 关联 Trigger。
 *
 * **始终常驻挂载**(对齐 Accordion):靠 data-state(open/closed)切换网格行高、CSS visibility 延迟过渡播放双向动画,
 * inert={!open} 在收起态对交互 / 读屏隐藏。常驻挂载保证(相对早期「收起即卸载」实现修复了三个真实 bug):
 * - 展开动画:节点已在 DOM,data-state closed→open 触发 grid-template-rows 过渡,不再被「带 open 态直接插入」跳过;
 * - 收起动画:节点不被卸载,grid 1fr→0fr 过渡完整播放,不会因 React 卸载而拦腰截断;
 * - 子树保活:收起不销毁 Content 子节点,子组件 state / 输入值 / 滚动位置 / 焦点全部保留。
 * 不再有「退场暂留 + 硬编码兜底定时器」机制,故也不受使用方覆盖 --ms-dur-base 时长的影响。
 */
export const CollapsibleContent = forwardRef<HTMLElement, CollapsibleContentProps>(
  // forceMount 已无作用(Content 始终挂载),解构吞掉避免被 ...rest 透传成非法 DOM 属性。
  ({ className, children, forceMount: _forceMount, ...rest }, ref) => {
    const { open, contentId, triggerId } = useCollapsibleContext('Content');

    return (
      <section
        ref={ref}
        id={contentId}
        aria-labelledby={triggerId}
        className={['ms-collapsible__content', className].filter(Boolean).join(' ')}
        data-state={open ? 'open' : 'closed'}
        // 收起态置 inert:不可聚焦、对 AT 隐藏;不改变布局,可即时应用而不打断收起动画。
        // 绘制层隐藏交给 CSS visibility 延迟过渡(收起过渡播完再 visibility:hidden),双向动画完整;
        // 不用 HTML hidden / display:none,否则会打断 grid-template-rows 过渡。
        inert={!open}
        {...rest}
      >
        <div className="ms-collapsible__content-inner">{children}</div>
      </section>
    );
  },
);
CollapsibleContent.displayName = 'Collapsible.Content';

export const Collapsible = CollapsibleRoot as CollapsibleComponent;
Collapsible.Trigger = CollapsibleTrigger;
Collapsible.Content = CollapsibleContent;
