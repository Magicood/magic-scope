// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HoverCard } from './HoverCard';

// HoverCard 默认走 hover 路径,需要 matchMedia('(hover: none)') 返回 false(桌面)。
// jsdom 不实现 matchMedia,这里 stub 成桌面(matches:false),个别用例再覆盖为触屏。
function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function renderBasic(props?: { openDelay?: number; closeDelay?: number; defaultOpen?: boolean }) {
  return render(
    <HoverCard openDelay={0} closeDelay={0} {...props}>
      <HoverCard.Trigger>
        <a href="/u/ada">@ada</a>
      </HoverCard.Trigger>
      <HoverCard.Content>
        <div>
          <strong>Ada Lovelace</strong>
          <a href="/u/ada/follow">关注</a>
        </div>
      </HoverCard.Content>
    </HoverCard>,
  );
}

describe('HoverCard', () => {
  beforeEach(() => {
    stubMatchMedia(false);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('trigger 渲染为用户自己的元素(asChild,保留 href),内容卡带基础类名', () => {
    renderBasic();
    const trigger = screen.getByRole('link', { name: '@ada' });
    expect(trigger).toHaveAttribute('href', '/u/ada');
    // 内容卡始终挂载(便于入场 / 退场动画),关闭态无 data-open
    const content = document.getElementById(trigger.getAttribute('aria-describedby') ?? '__none__');
    // 关闭时未关联 aria-describedby,故此处应取不到;改用类名定位卡片
    expect(content).toBeNull();
    const card = document.querySelector('.ms-hover-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('ms-hover-card--bottom');
    expect(card).toHaveClass('ms-tone-neutral');
  });

  it('pointerEnter trigger 打开(openDelay=0),trigger 关联 aria-describedby 指向卡片', () => {
    renderBasic();
    const trigger = screen.getByRole('link', { name: '@ada' });
    const card = document.querySelector('.ms-hover-card');
    expect(card).not.toHaveAttribute('data-open');

    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    expect(card).toHaveAttribute('data-open', 'true');
    expect(trigger).toHaveAttribute('aria-describedby', card?.id);
  });

  it('focus trigger 也打开(键盘可达)', () => {
    renderBasic();
    const trigger = screen.getByRole('link', { name: '@ada' });
    const card = document.querySelector('.ms-hover-card');

    act(() => {
      fireEvent.focus(trigger);
    });
    expect(card).toHaveAttribute('data-open', 'true');
  });

  it('内容卡不是 dialog(无 role=dialog / aria-modal),作补充信息层不抢焦', () => {
    renderBasic();
    const card = document.querySelector('.ms-hover-card');
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('aria-modal');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('从 trigger 移向 content(去向命中卡片)桥接不关闭', () => {
    renderBasic();
    const trigger = screen.getByRole('link', { name: '@ada' });
    const card = document.querySelector('.ms-hover-card') as HTMLElement;

    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    expect(card).toHaveAttribute('data-open', 'true');

    // 离开 trigger,relatedTarget 落在卡片内 → 桥接,不关
    act(() => {
      fireEvent.pointerLeave(trigger, { relatedTarget: card });
    });
    expect(card).toHaveAttribute('data-open', 'true');
  });

  it('从 trigger 移向空白区(relatedTarget 在外)关闭', () => {
    renderBasic();
    const trigger = screen.getByRole('link', { name: '@ada' });
    const card = document.querySelector('.ms-hover-card') as HTMLElement;

    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    expect(card).toHaveAttribute('data-open', 'true');

    act(() => {
      fireEvent.pointerLeave(trigger, { relatedTarget: document.body });
    });
    expect(card).not.toHaveAttribute('data-open');
  });

  it('openDelay / closeDelay 经定时器生效(fake timers)', () => {
    vi.useFakeTimers();
    renderBasic({ openDelay: 700, closeDelay: 300 });
    const trigger = screen.getByRole('link', { name: '@ada' });
    const card = document.querySelector('.ms-hover-card') as HTMLElement;

    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    // 未到 openDelay 不开
    act(() => {
      vi.advanceTimersByTime(699);
    });
    expect(card).not.toHaveAttribute('data-open');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(card).toHaveAttribute('data-open', 'true');

    // 离开:closeDelay 后才关
    act(() => {
      fireEvent.pointerLeave(trigger, { relatedTarget: document.body });
    });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(card).toHaveAttribute('data-open', 'true');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(card).not.toHaveAttribute('data-open');
  });

  it('Esc 即时关闭', () => {
    renderBasic();
    const trigger = screen.getByRole('link', { name: '@ada' });
    const card = document.querySelector('.ms-hover-card') as HTMLElement;

    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    expect(card).toHaveAttribute('data-open', 'true');

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(card).not.toHaveAttribute('data-open');
  });

  it('受控 open:内部不切换显隐,但触发回调', () => {
    const onOpenChange = vi.fn();
    render(
      <HoverCard open={false} openDelay={0} closeDelay={0} onOpenChange={onOpenChange}>
        <HoverCard.Trigger>
          <button type="button">头像</button>
        </HoverCard.Trigger>
        <HoverCard.Content>卡片</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByRole('button', { name: '头像' });
    const card = document.querySelector('.ms-hover-card') as HTMLElement;

    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    // 受控为 false:卡片仍关闭,但 onOpenChange(true) 被调用
    expect(card).not.toHaveAttribute('data-open');
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('defaultOpen 非受控初始打开', () => {
    renderBasic({ defaultOpen: true });
    const card = document.querySelector('.ms-hover-card') as HTMLElement;
    expect(card).toHaveAttribute('data-open', 'true');
  });

  it('compose:trigger 自带的 onPointerEnter 恰好触发一次(不被二次合并重复调用)且内部仍打开', () => {
    const userEnter = vi.fn();
    render(
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCard.Trigger>
          <a href="/once" onPointerEnter={userEnter}>
            @once
          </a>
        </HoverCard.Trigger>
        <HoverCard.Content>卡</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByRole('link', { name: '@once' });
    const card = document.querySelector('.ms-hover-card') as HTMLElement;

    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    expect(userEnter).toHaveBeenCalledTimes(1);
    expect(card).toHaveAttribute('data-open', 'true');
  });

  it('compose:用户在 trigger onPointerEnter 里 preventDefault 阻断内部打开', () => {
    render(
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCard.Trigger>
          <a
            href="/x"
            onPointerEnter={(e) => {
              e.preventDefault();
            }}
          >
            @x
          </a>
        </HoverCard.Trigger>
        <HoverCard.Content>卡</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByRole('link', { name: '@x' });
    const card = document.querySelector('.ms-hover-card') as HTMLElement;

    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    expect(card).not.toHaveAttribute('data-open');
  });

  it('placement / arrow / tone 落到卡片(data 属性 + 类名 + 箭头节点)', () => {
    render(
      <HoverCard openDelay={0} closeDelay={0} defaultOpen>
        <HoverCard.Trigger>
          <a href="/y">@y</a>
        </HoverCard.Trigger>
        <HoverCard.Content placement="right-start" tone="primary" arrow>
          卡
        </HoverCard.Content>
      </HoverCard>,
    );
    const card = document.querySelector('.ms-hover-card') as HTMLElement;
    expect(card).toHaveClass('ms-hover-card--right');
    expect(card).toHaveClass('ms-tone-primary');
    expect(card).toHaveAttribute('data-ms-side', 'right');
    expect(card).toHaveAttribute('data-ms-align', 'start');
    expect(card.querySelector('.ms-hover-card__arrow')).toBeInTheDocument();
  });

  it('classNames 细粒度槽位透传到 root / panel / arrow', () => {
    render(
      <HoverCard openDelay={0} closeDelay={0} defaultOpen>
        <HoverCard.Trigger>
          <a href="/z">@z</a>
        </HoverCard.Trigger>
        <HoverCard.Content arrow classNames={{ root: 'r-cls', panel: 'p-cls', arrow: 'a-cls' }}>
          卡
        </HoverCard.Content>
      </HoverCard>,
    );
    const card = document.querySelector('.ms-hover-card') as HTMLElement;
    expect(card).toHaveClass('r-cls');
    expect(card.querySelector('.ms-hover-card__panel')).toHaveClass('p-cls');
    expect(card.querySelector('.ms-hover-card__arrow')).toHaveClass('a-cls');
  });

  it('触屏(hover:none)降级:不靠 hover 打开,且内容卡 inert', () => {
    stubMatchMedia(true);
    renderBasic();
    const trigger = screen.getByRole('link', { name: '@ada' });
    const card = document.querySelector('.ms-hover-card') as HTMLElement;

    // useEffect 探测 coarse 后,inert 应被置上
    act(() => {
      // 触发一次 re-render 让 coarse effect 落地
      fireEvent.pointerEnter(trigger);
    });
    expect(card).toHaveAttribute('inert');
    // 触屏不靠 hover 打开
    expect(card).not.toHaveAttribute('data-open');
  });

  it('子部件脱离根渲染时抛出清晰错误', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<HoverCard.Content>孤儿</HoverCard.Content>)).toThrow(
      /必须渲染在 <HoverCard> 内部/,
    );
    spy.mockRestore();
  });

  // —— #1:触屏(coarse)下卡片不可见且 inert,trigger 不应暴露指向它的 aria-describedby(悬空引用) ——
  it('#1 触屏受控 open=true:卡片被吞成 inert 不可见,trigger 不暴露悬空 aria-describedby', () => {
    stubMatchMedia(true);
    render(
      <HoverCard open openDelay={0} closeDelay={0}>
        <HoverCard.Trigger>
          <a href="/u/ada">@ada</a>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <a href="/u/ada/follow">关注</a>
        </HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByRole('link', { name: '@ada' });
    const card = document.querySelector('.ms-hover-card') as HTMLElement;

    act(() => {
      // 触发一次 re-render,让 coarse effect 落地
      fireEvent.pointerEnter(trigger);
    });

    // 受控 open=true 但 coarse:卡片不可见(无 data-open)且 inert
    expect(card).not.toHaveAttribute('data-open');
    expect(card).toHaveAttribute('inert');
    // 关键断言:trigger 不应指向一张 inert / 不可达的卡片(否则 AT 念「有补充描述」却读不到)
    expect(trigger).not.toHaveAttribute('aria-describedby');
  });

  it('#1 桌面非触屏 open=true:卡片可见,trigger 正常关联 aria-describedby', () => {
    renderBasic({ defaultOpen: true });
    const trigger = screen.getByRole('link', { name: '@ada' });
    const card = document.querySelector('.ms-hover-card') as HTMLElement;
    expect(card).toHaveAttribute('data-open', 'true');
    expect(trigger).toHaveAttribute('aria-describedby', card.id);
    // 可见态不应 inert
    expect(card).not.toHaveAttribute('inert');
  });

  // —— #2:无原生 Popover API 的兜底分支,关闭态卡片须 inert 移出 tab / a11y 树 ——
  // 全局 vitest.setup 把 showPopover/hidePopover polyfill 到了 HTMLElement.prototype,
  // 故支持原生 Popover 的浏览器是默认路径(UA 规则 [popover]:not(:popover-open){display:none} 移出 tab 序)。
  // 要复现「不支持 Popover API」的兜底分支,需在本用例内临时摘掉这两个方法,事后还原。
  describe('#2 无原生 Popover API 的兜底分支(关闭态 inert)', () => {
    // 经 unknown 拿到可写下标视图,绕过 lib.dom 把 showPopover/hidePopover 声明为必有方法。
    const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
    let savedShow: unknown;
    let savedHide: unknown;
    beforeEach(() => {
      savedShow = proto.showPopover;
      savedHide = proto.hidePopover;
      // 摘除后 typeof el.showPopover !== 'function' → supportsPopover 为 false,走兜底路径
      proto.showPopover = undefined;
      proto.hidePopover = undefined;
    });
    afterEach(() => {
      proto.showPopover = savedShow;
      proto.hidePopover = savedHide;
    });

    it('关闭态:卡片置 inert,卡内可聚焦元素移出 tab / a11y 树', () => {
      renderBasic();
      const card = document.querySelector('.ms-hover-card') as HTMLElement;
      // 关闭态:无 data-open,但 inert 已置上(否则卡内 <a>关注</a> 隐藏却仍可 Tab / 被 AT 朗读)
      expect(card).not.toHaveAttribute('data-open');
      expect(card).toHaveAttribute('inert');
      // 卡内仍有该链接节点(始终挂载以做入场 / 退场动画),靠 inert 而非卸载来隐藏可聚焦元素
      expect(card.querySelector('a[href="/u/ada/follow"]')).toBeInTheDocument();
    });

    it('打开后 inert 撤除(卡内交互元素恢复可达),关闭后再次置回 inert', () => {
      renderBasic();
      const trigger = screen.getByRole('link', { name: '@ada' });
      const card = document.querySelector('.ms-hover-card') as HTMLElement;
      expect(card).toHaveAttribute('inert');

      act(() => {
        fireEvent.pointerEnter(trigger);
      });
      // 打开后卡片可见,inert 必须撤除,否则卡内链接 / 按钮无法交互
      expect(card).toHaveAttribute('data-open', 'true');
      expect(card).not.toHaveAttribute('inert');

      act(() => {
        fireEvent.pointerLeave(trigger, { relatedTarget: document.body });
      });
      // 关闭后重新置回 inert
      expect(card).not.toHaveAttribute('data-open');
      expect(card).toHaveAttribute('inert');
    });
  });

  it('#2 支持原生 Popover API(默认路径):关闭态不靠 inert(UA 规则移出 tab 序),卡片不加 inert', () => {
    // 全局 setup 已 polyfill showPopover/hidePopover → supportsPopover 为 true。
    // 此路径下关闭态由 [popover]:not(:popover-open){display:none} 兜底,组件不应多加 inert。
    renderBasic();
    const card = document.querySelector('.ms-hover-card') as HTMLElement;
    expect(card).not.toHaveAttribute('data-open');
    expect(card).not.toHaveAttribute('inert');
  });

  // —— #3:非原生可聚焦的 trigger(span / 自定义)须被注入 tabindex,保纯键盘 / AT 可达 ——
  it('#3 trigger 为非原生可聚焦元素(span)时注入 tabindex=0,键盘可聚焦并 focus-to-open', () => {
    render(
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCard.Trigger>
          <span>头像</span>
        </HoverCard.Trigger>
        <HoverCard.Content>卡</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByText('头像');
    const card = document.querySelector('.ms-hover-card') as HTMLElement;
    // 注入 tabindex=0:进入 tab 序,纯键盘 / AT 可聚焦
    expect(trigger).toHaveAttribute('tabindex', '0');

    // 聚焦即可触发 focus-to-open(否则非原生可聚焦 trigger 永远进不了 tab 序,补充信息丢失)
    act(() => {
      fireEvent.focus(trigger);
    });
    expect(card).toHaveAttribute('data-open', 'true');
  });

  it('#3 trigger 为原生可聚焦元素(<a href>)时不注入 tabindex(不污染原生 tab 序)', () => {
    renderBasic();
    const trigger = screen.getByRole('link', { name: '@ada' });
    expect(trigger).not.toHaveAttribute('tabindex');
  });

  it('#3 用户已显式给 trigger 的 tabIndex 时尊重其值(不被覆盖)', () => {
    render(
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCard.Trigger>
          <span tabIndex={-1}>头像</span>
        </HoverCard.Trigger>
        <HoverCard.Content>卡</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByText('头像');
    expect(trigger).toHaveAttribute('tabindex', '-1');
  });

  // —— anchor 定位回归:用户给 trigger 子元素传 style 时,不得覆盖掉组件注入的 anchor-name ——
  // 背景:CSS Anchor Positioning 靠 trigger 的 anchor-name + 卡片的 position-anchor 配对;若用户 style
  // 把 anchor-name 顶掉,锚点丢失 → 卡片掉到 top-layer 左上角。anchorName 必须殿后、不被二次覆盖。
  it('anchor:用户给 trigger 传 style 时,用户样式与 anchor-name 同时保留(anchorName 不被覆盖)', () => {
    render(
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCard.Trigger>
          <a href="/u/ada" style={{ maxInlineSize: '16rem' }}>
            @ada
          </a>
        </HoverCard.Trigger>
        <HoverCard.Content>卡</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByRole('link', { name: '@ada' });
    // 用户样式落地
    expect(trigger.style.getPropertyValue('max-inline-size')).toBe('16rem');
    // 关键:组件注入的 anchor-name 仍在(没被用户 style 覆盖掉)
    const anchorName = trigger.style.getPropertyValue('anchor-name');
    expect(anchorName).not.toBe('');
    expect(anchorName.startsWith('--ms-hover-card-')).toBe(true);
    // inline style 文本里两者并存
    const styleAttr = trigger.getAttribute('style') ?? '';
    expect(styleAttr).toContain('max-inline-size');
    expect(styleAttr).toContain('anchor-name');
  });

  it('anchor:即便用户 style 里也带 anchor-name,组件注入的 anchor-name 仍胜出(殿后不被覆盖)', () => {
    render(
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCard.Trigger>
          {/* 用户故意传一个 anchorName,组件刚需的 anchorName 必须仍然生效 */}
          <a href="/u/ada" style={{ anchorName: '--user-supplied' } as CSSProperties}>
            @ada
          </a>
        </HoverCard.Trigger>
        <HoverCard.Content>卡</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByRole('link', { name: '@ada' });
    const anchorName = trigger.style.getPropertyValue('anchor-name');
    // 组件注入的命名空间锚点胜出,而非用户的 --user-supplied
    expect(anchorName.startsWith('--ms-hover-card-')).toBe(true);
    expect(anchorName).not.toBe('--user-supplied');
  });

  it('anchor:内容卡始终带 position-anchor,与 trigger 的 anchor-name 同名配对', () => {
    render(
      <HoverCard openDelay={0} closeDelay={0} defaultOpen>
        <HoverCard.Trigger>
          <a href="/u/ada" style={{ maxInlineSize: '16rem' }}>
            @ada
          </a>
        </HoverCard.Trigger>
        <HoverCard.Content>卡</HoverCard.Content>
      </HoverCard>,
    );
    const trigger = screen.getByRole('link', { name: '@ada' });
    const card = document.querySelector('.ms-hover-card') as HTMLElement;
    const anchorName = trigger.style.getPropertyValue('anchor-name');
    const positionAnchor = card.style.getPropertyValue('position-anchor');
    // 面板 position-anchor 不丢,且与 trigger 的 anchor-name 同名(锚点正确配对)
    expect(positionAnchor).not.toBe('');
    expect(positionAnchor).toBe(anchorName);
  });
});
