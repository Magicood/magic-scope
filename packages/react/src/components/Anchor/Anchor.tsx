import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { type AnchorLinkOffset, hrefToId, resolveActiveLink } from './logic';

export type AnchorSize = 'sm' | 'md' | 'lg';

/** 单个锚点项;可一层(或多层)嵌套 children 形成缩进树。 */
export interface AnchorItem {
  /** 全树唯一标识(也是 active key / onChange 的载荷)。 */
  key: string;
  /** 目标锚点,形如 `#section-id`(指向页面里 id 为 section-id 的元素)。 */
  href: string;
  /** 链接展示内容(可为任意节点)。 */
  title: ReactNode;
  /** 子锚点(缩进一级);结构同本类型,可继续嵌套。 */
  children?: AnchorItem[] | undefined;
}

/** classNames 细粒度槽位:针对各子部件单独挂类名。 */
export interface AnchorClassNames {
  /** 根 nav。 */
  root?: string | undefined;
  /** 墨条指示器。 */
  indicator?: string | undefined;
  /** 链接列表 ul(每层都会带)。 */
  list?: string | undefined;
  /** 列表项 li。 */
  item?: string | undefined;
  /** 锚点链接 a。 */
  link?: string | undefined;
  /** active 链接附加。 */
  linkActive?: string | undefined;
}

export interface AnchorProps
  extends Omit<ComponentPropsWithoutRef<'nav'>, 'onChange' | 'children'> {
  /** 锚点数据(支持嵌套 children)。 */
  items: AnchorItem[];
  /** 判定偏移:命中线在容器顶部下方多少 px 处开始算「进入」。默认 0。 */
  offsetTop?: number | undefined;
  /** 点击滚动后,目标距容器顶部留白(滚动落点上移多少 px)。默认 0。 */
  targetOffset?: number | undefined;
  /**
   * active 变化回调(返回新的 active key;无命中为 null)。
   * @param activeKey 当前命中的锚点项 key(对应 items 里的 `key`);滚动未命中任何项时为 null。
   */
  onChange?: ((activeKey: string | null) => void) | undefined;
  /** 受控 active key(传入即受控,高亮由外部决定;仍触发 onChange)。 */
  activeKey?: string | null | undefined;
  /** 滚动容器获取器:返回监听滚动的元素或 window。默认 () => window。 */
  getContainer?: (() => HTMLElement | Window) | undefined;
  /** 命中边界(像素容差),越大越「提前」命中下一节。默认 5。 */
  bounds?: number | undefined;
  /** 尺寸(字号 / 行距 / 缩进随 data-ms-density 缩放)。默认 md。 */
  size?: AnchorSize | undefined;
  /** 墨条指示器开关。默认 true。 */
  showInk?: boolean | undefined;
  /** nav 的可访问名(landmark 标签)。默认「页内导航」。 */
  ariaLabel?: string | undefined;
  /** 子部件类名留口(细粒度槽位)。 */
  classNames?: AnchorClassNames | undefined;
}

const isWindow = (c: HTMLElement | Window): c is Window => c === (c as Window).window;

/**
 * Anchor —— 滚动锚点导航(scroll-spy)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 渲染锚点链(支持嵌套缩进),监听滚动容器算出当前可视区对应的 active key 并高亮 + 移动墨条指示;
 * 点击锚点 preventDefault 后平滑滚到目标(减弱动效 / data-ms-motion=off 时瞬时跳转);active 链接 aria-current="location"。
 *
 * 受控:传 activeKey 即由外部决定高亮(仍调 onChange)。留口:classNames 暴露各子部件、...rest 透传 nav 原生属性。
 * 「算哪个高亮」抽到同目录 logic.ts(纯函数 resolveActiveLink),壳层只负责读 DOM offset 与滚动副作用。
 * 样式见同目录 Anchor.css,需引入 @magic-scope/react/styles.css。
 */
export const Anchor = forwardRef<HTMLElement, AnchorProps>(
  (
    {
      items,
      offsetTop = 0,
      targetOffset = 0,
      onChange,
      activeKey: controlledActiveKey,
      getContainer,
      bounds = 5,
      size = 'md',
      showInk = true,
      ariaLabel = '页内导航',
      classNames,
      className,
      ...props
    },
    forwardedRef,
  ) => {
    const navRef = useRef<HTMLElement | null>(null);
    // key -> 链接 <a> 节点,用于定位墨条
    const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

    const isControlled = controlledActiveKey !== undefined;
    const [internalActive, setInternalActive] = useState<string | null>(null);
    const activeKey = isControlled ? controlledActiveKey : internalActive;

    // 上一次派发过的 active(用于在 updater 外纯比较是否要触发 onChange,
    // 避免把副作用写进 setState updater —— StrictMode 下 updater 会被双调用)
    const prevActiveRef = useRef<string | null>(internalActive);

    // 墨条几何(相对 nav 顶部)
    const [ink, setInk] = useState<{ top: number; height: number } | null>(null);

    // onChange 走 ref:每渲染同步最新闭包,避免父级每次换函数导致滚动监听频繁重订阅
    const onChangeRef = useRef<AnchorProps['onChange']>(onChange);
    onChangeRef.current = onChange;

    const resolveContainer = useCallback(
      (): HTMLElement | Window => (getContainer ? getContainer() : window),
      [getContainer],
    );

    // 读取每个目标元素相对滚动容器内容顶部的 top(DOM 副作用,留在壳层)
    const readOffsets = useCallback((): AnchorLinkOffset[] => {
      const container = resolveContainer();
      const out: AnchorLinkOffset[] = [];
      const collect = (list: AnchorItem[]): void => {
        for (const it of list) {
          const id = hrefToId(it.href);
          const el = id ? document.getElementById(id) : null;
          if (el) {
            let top: number;
            if (isWindow(container)) {
              top = el.getBoundingClientRect().top + window.scrollY;
            } else {
              top =
                el.getBoundingClientRect().top -
                container.getBoundingClientRect().top +
                container.scrollTop;
            }
            out.push({ key: it.key, top });
          }
          if (it.children && it.children.length > 0) {
            collect(it.children);
          }
        }
      };
      collect(items);
      return out;
    }, [items, resolveContainer]);

    const getScrollTop = useCallback((): number => {
      const container = resolveContainer();
      return isWindow(container) ? window.scrollY : container.scrollTop;
    }, [resolveContainer]);

    // 滚动 → 重算 active(非受控才落到内部 state;受控只发 onChange)
    useEffect(() => {
      const container = resolveContainer();
      let frame = 0;
      // 首帧 compute 只用来初始化 internalActive,不派发 onChange ——
      // 否则挂载时会把 active 从 null 跳到滚动算出的 key 并误发 onChange,与受控父级打架
      let initial = true;

      const compute = (): void => {
        frame = 0;
        const offsets = readOffsets();
        const next = resolveActiveLink(offsets, getScrollTop(), bounds, offsetTop);
        // updater 保持纯函数:只返回 next;onChange 在 updater 外按 prevActiveRef 比较触发
        setInternalActive(next);
        if (!initial && prevActiveRef.current !== next) {
          onChangeRef.current?.(next);
        }
        prevActiveRef.current = next;
        initial = false;
      };

      const onScroll = (): void => {
        if (frame === 0) {
          frame = window.requestAnimationFrame(compute);
        }
      };

      compute();
      container.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      return () => {
        if (frame !== 0) {
          window.cancelAnimationFrame(frame);
        }
        container.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      };
    }, [readOffsets, getScrollTop, bounds, offsetTop, resolveContainer]);

    // active 变化 → 定位墨条(布局阶段读,避免闪烁)。
    // items / size 进依赖是有意为之:列表项变更或尺寸档切换会改变链接几何,需重新测量墨条位置。
    // biome-ignore lint/correctness/useExhaustiveDependencies: items/size 用于触发重新测量(见上)
    useLayoutEffect(() => {
      if (!showInk) {
        setInk(null);
        return;
      }
      const nav = navRef.current;
      const link = activeKey != null ? linkRefs.current.get(activeKey) : undefined;
      if (!nav || !link) {
        setInk(null);
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      setInk({ top: linkRect.top - navRect.top, height: linkRect.height });
    }, [activeKey, showInk, items, size]);

    // 点击锚点:阻断默认跳转,平滑滚到目标(尊重 reduced-motion / data-ms-motion=off)
    const handleLinkClick = useCallback(
      (e: MouseEvent<HTMLAnchorElement>, item: AnchorItem): void => {
        const id = hrefToId(item.href);
        const target = id ? document.getElementById(id) : null;
        if (!target) {
          return; // 不是页内锚点 / 目标缺失:放行原生行为
        }
        e.preventDefault();

        const reduceMotion =
          typeof window !== 'undefined' &&
          (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
            document.documentElement.getAttribute('data-ms-motion') === 'off');
        const behavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth';

        const container = resolveContainer();
        if (isWindow(container)) {
          const top = target.getBoundingClientRect().top + window.scrollY - targetOffset;
          window.scrollTo({ top, behavior });
        } else {
          const top =
            target.getBoundingClientRect().top -
            container.getBoundingClientRect().top +
            container.scrollTop -
            targetOffset;
          container.scrollTo({ top, behavior });
        }

        // 点击即时反馈:非受控立刻高亮目标(滚动事件也会再确认一次)
        if (!isControlled) {
          // updater 保持纯函数:只返回 next;onChange 在 updater 外比较触发
          setInternalActive(item.key);
          if (prevActiveRef.current !== item.key) {
            onChange?.(item.key);
          }
          prevActiveRef.current = item.key;
        } else {
          onChange?.(item.key);
        }
      },
      [resolveContainer, targetOffset, isControlled, onChange],
    );

    const setLinkRef = useCallback(
      (key: string) =>
        (node: HTMLAnchorElement | null): void => {
          if (node) {
            linkRefs.current.set(key, node);
          } else {
            linkRefs.current.delete(key);
          }
        },
      [],
    );

    const setNavRef = useCallback(
      (node: HTMLElement | null): void => {
        navRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    const listClasses = ['ms-anchor__list', classNames?.list].filter(Boolean).join(' ');

    const renderList = (list: AnchorItem[], depth: number): ReactNode => (
      <ul className={listClasses} data-depth={depth}>
        {list.map((item) => {
          const isActive = item.key === activeKey;
          const linkClasses = [
            'ms-anchor__link',
            isActive && 'ms-anchor__link--active',
            classNames?.link,
            isActive && classNames?.linkActive,
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <li
              key={item.key}
              className={['ms-anchor__item', classNames?.item].filter(Boolean).join(' ')}
            >
              <a
                ref={setLinkRef(item.key)}
                href={item.href}
                className={linkClasses}
                aria-current={isActive ? 'location' : undefined}
                data-key={item.key}
                onClick={(e) => handleLinkClick(e, item)}
              >
                <span className="ms-anchor__link-text">{item.title}</span>
              </a>
              {item.children && item.children.length > 0
                ? renderList(item.children, depth + 1)
                : null}
            </li>
          );
        })}
      </ul>
    );

    const rootClasses = [
      'ms-anchor',
      `ms-anchor--${size}`,
      'ms-tone-primary',
      className,
      classNames?.root,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <nav ref={setNavRef} aria-label={ariaLabel} className={rootClasses} {...props}>
        {showInk ? (
          <span
            className={['ms-anchor__ink', classNames?.indicator].filter(Boolean).join(' ')}
            aria-hidden="true"
            data-visible={ink ? '' : undefined}
            style={
              ink
                ? ({
                    '--ms-anchor-ink-y': `${ink.top}px`,
                    '--ms-anchor-ink-h': `${ink.height}px`,
                  } as Record<string, string>)
                : undefined
            }
          />
        ) : null}
        {renderList(items, 0)}
      </nav>
    );
  },
);
Anchor.displayName = 'Anchor';
