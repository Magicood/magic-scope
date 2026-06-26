import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useMemo,
} from 'react';
import { MessagesProvider, type PartialMessages } from '../../i18n';
import { composeRefs, mergeAsChildProps } from '../../utils/compose';
import {
  type ConfigDensity,
  type ConfigFx,
  type ConfigMotion,
  type ConfigSize,
  type ConfigTone,
  resolveDataAttrs,
} from './logic';

export type {
  ConfigDensity,
  ConfigFx,
  ConfigMotion,
  ConfigSize,
  ConfigTone,
} from './logic';

/**
 * JS 侧默认值快照 —— ConfigProvider 经 context 暴露给「少数需在 JS 里读默认值」的组件。
 *
 * 诚实备注:多数视觉开关(density / motion / fx)靠 CSS data 属性沿级联生效,组件读样式即可,
 * 不必读 context;context 主要给那种「需要在渲染逻辑里拿默认 tone / size / density」的场景兜底。
 */
export interface ConfigContextValue {
  /** 默认密度档(同时已落到根 data-ms-density,组件多数情况只需读 CSS)。 */
  density: ConfigDensity | undefined;
  /** 默认控件尺寸档,供组件 size prop 缺省时兜底(纯 JS 默认值,无对应 CSS data 属性)。 */
  size: ConfigSize | undefined;
  /** 默认语义色调,供组件 tone prop 缺省时兜底。 */
  tone: ConfigTone | undefined;
}

const DEFAULT_CONFIG: ConfigContextValue = {
  density: undefined,
  size: undefined,
  tone: undefined,
};

const ConfigContext = createContext<ConfigContextValue>(DEFAULT_CONFIG);

/**
 * 读取最近 ConfigProvider 的默认值(density / size / tone)。
 * 无祖先 Provider 时返回全 undefined 的兜底值(组件按自身默认行事)。
 *
 * 典型用法:`const { size } = useConfig(); const finalSize = props.size ?? size ?? 'md';`
 */
export function useConfig(): ConfigContextValue {
  return useContext(ConfigContext);
}

export interface ConfigProviderOwnProps {
  /** 密度档 → data-ms-density,沿级联缩放控件高度与间距。同时进 context 供 JS 读默认。 */
  density?: ConfigDensity | undefined;
  /** 动效总闸 → data-ms-motion(on=full / subtle / reduced=subtle / off)。off 时全库动效停。 */
  motion?: ConfigMotion | undefined;
  /** 装饰发光总闸 → data-ms-fx(on=full / subtle / off)。off 时装饰发光消失(聚焦环不受影响)。 */
  fx?: ConfigFx | undefined;
  /**
   * 默认语义色调。落 data-ms-tone(供 CSS 选择器)并进 context 供组件 tone 缺省兜底。
   * 注意:不渲染 ms-tone-{tone} 类(那是实例级 tone 槽位激活,应由各组件按自身 tone 决定)。
   */
  tone?: ConfigTone | undefined;
  /** 默认控件尺寸档,纯经 context 下发(无对应 CSS data 属性),供组件 size 缺省兜底。 */
  size?: ConfigSize | undefined;
  /**
   * 文案覆盖。给出时内部用 i18n 的 MessagesProvider 包裹 children 下发(可与父级文案合并)。
   * 不传则不额外套 Provider(透传父级文案)。
   */
  messages?: PartialMessages | undefined;
  /** 语言标记,写到根元素 lang(便于 hyphens / 字体回退 / 读屏语种)。不做内置文案切换。 */
  locale?: string | undefined;
  /** 多态根标签(默认 div)。语义场景可换 section / main 等。 */
  as?: ElementType;
  /**
   * 渲染为唯一子元素并把 data-ms-* 与 props 合并上去(Slot 模式)。
   * 用于「不想多包一层 div、直接把全局开关挂到已有根节点(如布局容器 / <html> 镜像)」的场景。
   */
  asChild?: boolean;
  children?: ReactNode;
}

export type ConfigProviderProps = ConfigProviderOwnProps &
  Omit<ComponentPropsWithoutRef<'div'>, keyof ConfigProviderOwnProps>;

const cx = (...parts: Array<string | false | undefined>): string => parts.filter(Boolean).join(' ');

/**
 * ConfigProvider —— 全局配置上下文(category: utility)。自研、消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 把全库的设计开关在一处统一设置,经 `data-ms-*` 属性沿 **CSS 级联** 下发:组件读祖先的
 * `data-ms-density` / `data-ms-motion` / `data-ms-fx` / `data-ms-tone`(配 device.css / effects.css 的
 * token 定义),**不靠 JS prop 钻透**。可嵌套(就近覆盖);可只设部分开关(未设的继承祖先 / 用根基线)。
 *
 * 同时 createContext 暴露 density / size / tone 默认值,经 `useConfig()` 供「少数需在 JS 里读默认值」
 * 的组件兜底(如组件 `size` 缺省时取全局默认)。**诚实备注:多数视觉开关靠 CSS data 属性生效,
 * context 仅服务于需 JS 默认值的场景,不是视觉开关的下发通道。**
 *
 * 给 `messages` 时内部用 i18n 的 `MessagesProvider` 包裹 children 下发/合并文案。
 *
 * **留口**:`...rest` 透传原生属性与事件到根;`className`/`style` 合并;`forwardRef` 到根元素;
 * `as` 多态根、`asChild` Slot 把开关挂到已有节点。**a11y**:透明包裹,默认 div 无语义、不破坏文档结构;
 * 用户值优先,不强加 role。样式/token 见 device.css + effects.css(需引入 @magic-scope/react/styles.css)。
 */
export const ConfigProvider = forwardRef<HTMLElement, ConfigProviderProps>(function ConfigProvider(
  {
    density,
    motion,
    fx,
    tone,
    size,
    messages,
    locale,
    as,
    asChild = false,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  // props → 根元素 data-ms-* 属性集合(纯逻辑;只落给定的开关)
  const dataAttrs = useMemo(
    () => resolveDataAttrs({ density, motion, fx, tone }),
    [density, motion, fx, tone],
  );

  // JS 默认值快照:先继承父级 ConfigProvider,再只覆盖本层显式给出的字段(与 CSS data-attr 级联一致)
  const parent = useContext(ConfigContext);
  const contextValue = useMemo<ConfigContextValue>(
    () => ({
      density: density ?? parent.density,
      size: size ?? parent.size,
      tone: tone ?? parent.tone,
    }),
    [density, size, tone, parent],
  );

  const classes = cx('ms-config-provider', className);

  // 给 messages 才套 MessagesProvider(否则透传父级文案,不多余包一层)
  const wrap = (node: ReactNode): ReactNode =>
    messages != null ? <MessagesProvider messages={messages}>{node}</MessagesProvider> : node;

  // asChild:把 data-ms-* / lang / props 合并到唯一子元素(Slot 模式),不额外包 DOM
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{
      className?: string;
      style?: CSSProperties;
      children?: ReactNode;
    }>;
    const childRef = (child as { ref?: Ref<unknown> }).ref;
    const merged = mergeAsChildProps(
      {
        ...rest,
        ...dataAttrs,
        ...(locale != null ? { lang: locale } : {}),
        className: classes,
        ...(style != null ? { style } : {}),
      },
      child.props as Record<string, unknown>,
    );
    const cloned = (
      <ConfigContext.Provider value={contextValue}>
        {cloneElement(child, {
          ...merged,
          ref: composeRefs(ref as Ref<unknown>, childRef),
        } as Record<string, unknown>)}
      </ConfigContext.Provider>
    );
    return <>{wrap(cloned)}</>;
  }

  const Comp = (as ?? 'div') as ElementType;
  const tree = (
    <ConfigContext.Provider value={contextValue}>
      <Comp
        ref={ref}
        className={classes}
        lang={locale}
        {...(style != null ? { style } : {})}
        {...dataAttrs}
        {...rest}
      >
        {children}
      </Comp>
    </ConfigContext.Provider>
  );

  return <>{wrap(tree)}</>;
});
ConfigProvider.displayName = 'ConfigProvider';
