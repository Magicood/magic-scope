// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Marquee } from './Marquee';

/** 把 matchMedia 设成可控:reduced 为 reduce 媒体查询是否命中。 */
function stubMatchMedia(reduced: boolean) {
  const mql = {
    matches: reduced,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mql),
  );
  return mql;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Marquee', () => {
  it('渲染根容器 + 轨道,带基础类名', () => {
    const { container } = render(<Marquee>滚动文本</Marquee>);
    const root = container.querySelector('.ms-marquee');
    expect(root).toBeInTheDocument();
    expect(root?.querySelector('.ms-marquee__track')).toBeInTheDocument();
  });

  it('默认克隆至少 2 份;首份可读,其余克隆份对 AT aria-hidden', () => {
    const { container } = render(<Marquee>独此一份</Marquee>);
    const groups = container.querySelectorAll('.ms-marquee__group');
    // 未测得尺寸(jsdom 下 getBoundingClientRect 全 0)→ 退回 min=2
    expect(groups.length).toBeGreaterThanOrEqual(2);
    // 第一份无 aria-hidden(可读)
    expect(groups[0]).not.toHaveAttribute('aria-hidden');
    // 其余份 aria-hidden
    for (let i = 1; i < groups.length; i++) {
      expect(groups[i]).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('显式 repeat 固定克隆份数', () => {
    const { container } = render(<Marquee repeat={4}>x</Marquee>);
    expect(container.querySelectorAll('.ms-marquee__group')).toHaveLength(4);
  });

  it('aria-label 透传到根,整体可被命名;内容不抢焦点(根无 tabindex)', () => {
    const { container } = render(<Marquee aria-label="赞助商滚动">logo</Marquee>);
    const root = container.querySelector('.ms-marquee');
    expect(root).toHaveAttribute('aria-label', '赞助商滚动');
    expect(root).not.toHaveAttribute('tabindex');
  });

  it('vertical 或纵向 direction 加 --vertical 类', () => {
    const { container: c1 } = render(<Marquee vertical>v</Marquee>);
    expect(c1.querySelector('.ms-marquee')).toHaveClass('ms-marquee--vertical');
    const { container: c2 } = render(<Marquee direction="up">u</Marquee>);
    expect(c2.querySelector('.ms-marquee')).toHaveClass('ms-marquee--vertical');
  });

  it('direction 写到 data-ms-direction;right/down 反向动画方向变量为 reverse', () => {
    const { container } = render(<Marquee direction="right">r</Marquee>);
    const root = container.querySelector('.ms-marquee') as HTMLElement;
    expect(root).toHaveAttribute('data-ms-direction', 'right');
    expect(root.style.getPropertyValue('--ms-marquee-direction')).toBe('reverse');
  });

  it('reverse 与方向异或:right + reverse 抵消回 normal', () => {
    const { container } = render(
      <Marquee direction="right" reverse>
        r
      </Marquee>,
    );
    const root = container.querySelector('.ms-marquee') as HTMLElement;
    expect(root.style.getPropertyValue('--ms-marquee-direction')).toBe('normal');
  });

  it('duration 优先:写入固定一圈秒数变量', () => {
    const { container } = render(<Marquee duration={8}>d</Marquee>);
    const root = container.querySelector('.ms-marquee') as HTMLElement;
    expect(root.style.getPropertyValue('--ms-marquee-duration')).toBe('8s');
  });

  it('gradient 开启加遮罩类;gradientColor / gradientWidth 写入变量', () => {
    const { container } = render(
      <Marquee gradient gradientColor="#101014" gradientWidth={40}>
        g
      </Marquee>,
    );
    const root = container.querySelector('.ms-marquee') as HTMLElement;
    expect(root).toHaveClass('ms-marquee--gradient');
    expect(root.style.getPropertyValue('--ms-marquee-fade-color')).toBe('#101014');
    expect(root.style.getPropertyValue('--ms-marquee-fade')).toBe('40px');
  });

  it('gap 数字按 px 写入变量;字符串原样', () => {
    const { container: c1 } = render(<Marquee gap={24}>x</Marquee>);
    expect(
      (c1.querySelector('.ms-marquee') as HTMLElement).style.getPropertyValue('--ms-marquee-gap'),
    ).toBe('24px');
    const { container: c2 } = render(<Marquee gap="2rem">x</Marquee>);
    expect(
      (c2.querySelector('.ms-marquee') as HTMLElement).style.getPropertyValue('--ms-marquee-gap'),
    ).toBe('2rem');
  });

  it('pauseOnHover 默认开:加 --pause-hover 类', () => {
    const { container } = render(<Marquee>h</Marquee>);
    expect(container.querySelector('.ms-marquee')).toHaveClass('ms-marquee--pause-hover');
    const { container: c2 } = render(<Marquee pauseOnHover={false}>h</Marquee>);
    expect(c2.querySelector('.ms-marquee')).not.toHaveClass('ms-marquee--pause-hover');
  });

  it('pauseOnClick:按下加 --paused,松开移除;合并用户 onPointerDown', () => {
    const onPointerDown = vi.fn();
    const { container } = render(
      <Marquee pauseOnClick onPointerDown={onPointerDown}>
        c
      </Marquee>,
    );
    const root = container.querySelector('.ms-marquee') as HTMLElement;
    expect(root).not.toHaveClass('ms-marquee--paused');
    fireEvent.pointerDown(root);
    expect(root).toHaveClass('ms-marquee--paused');
    expect(onPointerDown).toHaveBeenCalledTimes(1);
    fireEvent.pointerUp(root);
    expect(root).not.toHaveClass('ms-marquee--paused');
  });

  it('reduced-motion 命中时停止滚动:加 --paused 类', () => {
    stubMatchMedia(true);
    const { container } = render(<Marquee>m</Marquee>);
    expect(container.querySelector('.ms-marquee')).toHaveClass('ms-marquee--paused');
  });

  it('reduced-motion 未命中时正常滚动:无 --paused 类', () => {
    stubMatchMedia(false);
    const { container } = render(<Marquee>m</Marquee>);
    expect(container.querySelector('.ms-marquee')).not.toHaveClass('ms-marquee--paused');
  });

  it('classNames 细粒度槽位拼接到对应部件', () => {
    const { container } = render(
      <Marquee classNames={{ root: 'r-slot', track: 't-slot', group: 'g-slot' }}>x</Marquee>,
    );
    expect(container.querySelector('.ms-marquee')).toHaveClass('r-slot');
    expect(container.querySelector('.ms-marquee__track')).toHaveClass('t-slot');
    expect(container.querySelector('.ms-marquee__group')).toHaveClass('g-slot');
  });

  it('透传 className 与原生属性(id),合并用户 onPointerLeave', () => {
    const onPointerLeave = vi.fn();
    const { container } = render(
      <Marquee id="promo" className="extra" onPointerLeave={onPointerLeave}>
        x
      </Marquee>,
    );
    const root = container.querySelector('.ms-marquee') as HTMLElement;
    expect(root).toHaveAttribute('id', 'promo');
    expect(root).toHaveClass('extra');
    fireEvent.pointerLeave(root);
    expect(onPointerLeave).toHaveBeenCalledTimes(1);
  });

  it('forwardRef 指向根容器', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Marquee ref={ref}>x</Marquee>);
    expect(ref.current).toHaveClass('ms-marquee');
  });

  // —— 回归:非零 gap 下无缝循环不跳变 ——
  // bug:track 用 flex `gap` 分隔 N 份 → 总宽 N·单份 + (N−1)·gap,位移 -100/N% 比无缝所需的
  // 「单份 + gap」少 gap/N → 每圈跳 gap/N 像素。修法:track 去 flex gap,份间距改为 group 尾随 margin,
  // 使重复周期 = 单份 + gap 与位移严格一致。
  describe('无缝循环:份间距并入重复单元(不用 track flex gap)', () => {
    // vitest 从仓库根运行(cwd = repo root),按已知包内路径定位 CSS 源。
    const cssPath = join(process.cwd(), 'packages/react/src/components/Marquee/Marquee.css');
    const css = readFileSync(cssPath, 'utf8');

    /** 抽出某选择器块体(到下一个 `}`,不含嵌套——本文件这些选择器块均无嵌套)。 */
    function block(selector: string): string {
      const idx = css.indexOf(selector);
      expect(idx, `未找到选择器 ${selector}`).toBeGreaterThanOrEqual(0);
      const open = css.indexOf('{', idx);
      const close = css.indexOf('}', open);
      return css.slice(open + 1, close);
    }

    it('track 不再用 flex `gap` 分隔克隆份(否则每圈跳 gap/N)', () => {
      // track 块体内不得出现 `gap:` 声明(flex gap 会让位移与重复周期不一致)
      expect(block('.ms-marquee__track {')).not.toMatch(/(^|\s|;)gap\s*:/);
    });

    it('横向:每个 group 带等于 gap 的尾随 margin-inline-end(份间距并入重复单元)', () => {
      const g = block('.ms-marquee__group {');
      expect(g).toMatch(/margin-inline-end:\s*var\(--ms-marquee-gap\)/);
    });

    it('纵向:group 改用尾随 margin-block-end,并清零横向 margin 避免双向叠加', () => {
      const v = block('.ms-marquee--vertical .ms-marquee__group {');
      expect(v).toMatch(/margin-block-end:\s*var\(--ms-marquee-gap\)/);
      expect(v).toMatch(/margin-inline-end:\s*0/);
    });
  });

  it('speed→duration 用「单份 + gap」真实位移距离换算(读 group 尾随 margin 量 gap)', () => {
    // jsdom 下 getBoundingClientRect 全 0、computed margin 为 ''→0,故走 fallback;
    // 这里锁住「组件确实把 group 的 computed margin 读进了换算路径」——
    // 用真实有限尺寸的 stub 验证 duration 含 gap 段。
    const W = 800;
    const GAP = 16;
    const SPEED = 100;
    // stub getBoundingClientRect:root 容器与 group 单份都给宽 W(让 contentSize=W)
    const rectProto = Element.prototype.getBoundingClientRect;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      const isGroup = (this as HTMLElement).classList.contains('ms-marquee__group');
      return {
        width: isGroup ? W : W * 4,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    });
    // stub getComputedStyle 让 group 的 marginInlineEnd 解析成 GAP px
    const realGCS = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (el: Element, pseudo?: string | null) => {
        const cs = realGCS(el, pseudo ?? undefined);
        if ((el as HTMLElement).classList.contains('ms-marquee__group')) {
          return new Proxy(cs, {
            get(target, prop) {
              if (prop === 'marginInlineEnd') return `${GAP}px`;
              const v = Reflect.get(target, prop);
              return typeof v === 'function' ? v.bind(target) : v;
            },
          });
        }
        return cs;
      },
    );

    const { container } = render(
      <Marquee speed={SPEED} gap={GAP}>
        x
      </Marquee>,
    );
    const root = container.querySelector('.ms-marquee') as HTMLElement;
    // 真实一圈 = (W + GAP) / SPEED = 816 / 100 = 8.16s;若漏算 gap(旧 bug)则为 8s
    expect(root.style.getPropertyValue('--ms-marquee-duration')).toBe('8.16s');

    Element.prototype.getBoundingClientRect = rectProto;
  });
});
