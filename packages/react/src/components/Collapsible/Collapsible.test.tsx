// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Collapsible } from './Collapsible';

function renderBasic(props?: React.ComponentProps<typeof Collapsible>) {
  return render(
    <Collapsible {...props}>
      <Collapsible.Trigger>切换</Collapsible.Trigger>
      <Collapsible.Content>
        <p>折叠内容</p>
      </Collapsible.Content>
    </Collapsible>,
  );
}

describe('Collapsible', () => {
  it('默认收起:trigger aria-expanded=false,Content 常驻挂载但 closed + inert(对交互/AT 隐藏)', () => {
    renderBasic();
    const trigger = screen.getByRole('button', { name: '切换' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // 常驻挂载(对齐 Accordion):收起态 Content 仍在 DOM,但 data-state=closed 且 inert。
    const region = screen.getByText('折叠内容').closest('section');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('data-state', 'closed');
    expect(region).toHaveAttribute('inert');
  });

  it('defaultOpen 非受控:初始展开,内容可见且 region 关联 trigger', () => {
    renderBasic({ defaultOpen: true });
    const trigger = screen.getByRole('button', { name: '切换' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const region = screen.getByRole('region');
    expect(region).toHaveTextContent('折叠内容');
    // aria-controls / aria-labelledby 双向关联
    expect(trigger.getAttribute('aria-controls')).toBe(region.getAttribute('id'));
    expect(region.getAttribute('aria-labelledby')).toBe(trigger.getAttribute('id'));
  });

  it('点击 trigger 切换 aria-expanded + Content data-state/inert(非受控自管状态)', () => {
    renderBasic();
    const trigger = screen.getByRole('button', { name: '切换' });
    const region = screen.getByText('折叠内容').closest('section');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(region).toHaveAttribute('data-state', 'closed');
    expect(region).toHaveAttribute('inert');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // 展开后:同一 section 节点(未被卸载重建)翻到 open 且去 inert。
    expect(region).toHaveAttribute('data-state', 'open');
    expect(region).not.toHaveAttribute('inert');
  });

  it('受控模式:open 不变时点击只回调、内部不自切(状态由外部驱动)', () => {
    const onOpenChange = vi.fn();
    render(
      <Collapsible open={false} onOpenChange={onOpenChange}>
        <Collapsible.Trigger>切换</Collapsible.Trigger>
        <Collapsible.Content>受控内容</Collapsible.Content>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: '切换' });
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // 受控:外部没把 open 改 true,故仍收起
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('disabled:trigger 被禁用,点击不触发 onOpenChange', () => {
    const onOpenChange = vi.fn();
    render(
      <Collapsible disabled onOpenChange={onOpenChange}>
        <Collapsible.Trigger>切换</Collapsible.Trigger>
        <Collapsible.Content>内容</Collapsible.Content>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: '切换' });
    expect(trigger).toBeDisabled();
    fireEvent.click(trigger);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('forceMount:收起态仍挂载内容,但置 inert(对交互/AT 隐藏)', () => {
    render(
      <Collapsible forceMount>
        <Collapsible.Trigger>切换</Collapsible.Trigger>
        <Collapsible.Content>SEO 内容</Collapsible.Content>
      </Collapsible>,
    );
    // 收起也在 DOM(forceMount):section 仍挂载
    const region = screen.getByText('SEO 内容').closest('section');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('data-state', 'closed');
    expect(region).toHaveAttribute('inert');
  });

  it('Trigger 自定义 onClick 先于内部切换执行;preventDefault 可阻断', () => {
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
    render(
      <Collapsible>
        <Collapsible.Trigger onClick={onClick}>切换</Collapsible.Trigger>
        <Collapsible.Content>内容</Collapsible.Content>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: '切换' });
    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalledTimes(1);
    // preventDefault 阻断了内部 toggle
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('键盘 Enter/Space:原生 button 触发 click 即切换(模拟 click 验证回调链)', () => {
    const onOpenChange = vi.fn();
    render(
      <Collapsible onOpenChange={onOpenChange}>
        <Collapsible.Trigger>切换</Collapsible.Trigger>
        <Collapsible.Content>内容</Collapsible.Content>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: '切换' });
    // 原生 button 把 Enter/Space 转成 click,这里直接 fire click 验证内部切换语义
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('tone / className 透传到根,且 data-state 反映开合', () => {
    const { container } = renderBasic({ tone: 'success', className: 'my-cls', defaultOpen: true });
    const root = container.querySelector('.ms-collapsible');
    expect(root).toHaveClass('ms-tone-success');
    expect(root).toHaveClass('my-cls');
    expect(root).toHaveClass('ms-collapsible--open');
    expect(root).toHaveAttribute('data-state', 'open');
  });

  it('根透传原生属性(...rest)如 data-* 到根容器', () => {
    const { container } = render(
      <Collapsible data-testid="cl" aria-label="区块">
        <Collapsible.Trigger>切换</Collapsible.Trigger>
        <Collapsible.Content>内容</Collapsible.Content>
      </Collapsible>,
    );
    const root = container.querySelector('.ms-collapsible');
    expect(root).toHaveAttribute('data-testid', 'cl');
    expect(root).toHaveAttribute('aria-label', '区块');
  });

  it('子部件在 <Collapsible> 之外渲染抛出清晰错误', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Collapsible.Trigger>孤儿</Collapsible.Trigger>)).toThrow(
      /必须渲染在 <Collapsible> 内部/,
    );
    spy.mockRestore();
  });

  // —— 回归:三条经对抗性评审确认的真实 bug,均由「收起即卸载 + 退场暂留 + 硬编码兜底定时器」实现引起。 ——
  // 现方案:Content 常驻挂载 + inert 切换(对齐 Accordion),一并根治。

  describe('回归 #1 [HIGH] 收起不卸载 Content 子树(子组件 state / 节点保活)', () => {
    /** 探针:统计自身 mount / unmount 次数,并保存一个仅初始化一次的内部 state。 */
    function makeProbe() {
      const counters = { mounts: 0, unmounts: 0 };
      function Probe() {
        // 初始值含随机性:若被卸载重建,值会变 —— 用于断言「同一实例存活」。
        const [token] = useState(() => Math.random().toString(36).slice(2));
        useEffect(() => {
          counters.mounts += 1;
          return () => {
            counters.unmounts += 1;
          };
        }, []);
        return <span data-testid="probe">{token}</span>;
      }
      return { Probe, counters };
    }

    it('defaultOpen 展开后收起一次:Content 子树未被卸载重建(mounts=1 / unmounts=0)', () => {
      const { Probe, counters } = makeProbe();
      render(
        <Collapsible defaultOpen>
          <Collapsible.Trigger>切换</Collapsible.Trigger>
          <Collapsible.Content>
            <Probe />
          </Collapsible.Content>
        </Collapsible>,
      );
      const trigger = screen.getByRole('button', { name: '切换' });
      const tokenBefore = screen.getByTestId('probe').textContent;
      expect(counters).toEqual({ mounts: 1, unmounts: 0 });

      // 收起一次:旧实现会卸载又重挂(mounts:2 / unmounts:1)并重置子组件 state。
      fireEvent.click(trigger);

      // 探针仍在 DOM、未被卸载、内部 token 不变 —— 子树完整保活。
      const probe = screen.getByTestId('probe');
      expect(probe).toBeInTheDocument();
      expect(probe.textContent).toBe(tokenBefore);
      expect(counters).toEqual({ mounts: 1, unmounts: 0 });

      // 收起后:section 翻 closed + inert,但节点本身没动。
      const region = probe.closest('section');
      expect(region).toHaveAttribute('data-state', 'closed');
      expect(region).toHaveAttribute('inert');
    });

    it('多次开合:输入框里的值不因收起被重置(子组件状态保活)', () => {
      render(
        <Collapsible defaultOpen>
          <Collapsible.Trigger>切换</Collapsible.Trigger>
          <Collapsible.Content>
            <input data-testid="field" defaultValue="" />
          </Collapsible.Content>
        </Collapsible>,
      );
      const trigger = screen.getByRole('button', { name: '切换' });
      const field = screen.getByTestId('field') as HTMLInputElement;
      fireEvent.change(field, { target: { value: '草稿内容' } });
      expect(field.value).toBe('草稿内容');

      fireEvent.click(trigger); // 收起
      fireEvent.click(trigger); // 再展开

      // 同一 input 实例存活,用户输入未丢。
      expect((screen.getByTestId('field') as HTMLInputElement).value).toBe('草稿内容');
    });
  });

  describe('回归 #2 [MED] 首次展开走 mount-then-flip 等价路径:节点常驻,翻 data-state 即可触发过渡', () => {
    it('从收起态首次展开:section 同一节点从 closed→open(非「带 open 态新插入」)', () => {
      renderBasic();
      const trigger = screen.getByRole('button', { name: '切换' });
      // 收起态节点已在 DOM(closed),这是过渡能触发的前提:展开只需翻 data-state。
      const before = screen.getByText('折叠内容').closest('section');
      expect(before).toHaveAttribute('data-state', 'closed');

      fireEvent.click(trigger);

      const after = screen.getByText('折叠内容').closest('section');
      // 关键:展开前后是同一个 DOM 节点(非卸载重建),浏览器据此从 closed 样式过渡到 open 样式。
      expect(after).toBe(before);
      expect(after).toHaveAttribute('data-state', 'open');
    });
  });

  describe('回归 #3 [LOW] 不再有硬编码兜底定时器:不受 --ms-dur-base 覆盖影响', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('收起不依赖任何 setTimeout 卸载(即便从不触发 transitionend / fake timers 永不前进)', () => {
      // 旧实现:收起后靠 setTimeout(400) 把 exiting 置 false 才卸载,使用方把 --ms-dur-base 调到
      // ≥400ms 时会被提前截断。现方案常驻挂载,收起后节点恒在,卸载逻辑被彻底移除。
      vi.useFakeTimers();
      const { unmount } = renderBasic({ defaultOpen: true });
      const trigger = screen.getByRole('button', { name: '切换' });

      fireEvent.click(trigger); // 收起;jsdom 不会派发 transitionend,fake timers 也不前进

      // 不前进任何定时器:Content 依旧在 DOM(不存在「等定时器才卸载」的隐含假设)。
      const region = screen.getByText('折叠内容').closest('section');
      expect(region).toBeInTheDocument();
      expect(region).toHaveAttribute('data-state', 'closed');
      expect(region).toHaveAttribute('inert');

      // 即便把任意挂起定时器跑完,行为也不变(没有定时器在驱动卸载)。
      vi.runOnlyPendingTimers();
      expect(screen.getByText('折叠内容').closest('section')).toBeInTheDocument();
      unmount();
    });
  });

  it('forceMount 已废弃:传入不改变行为(Content 恒挂载),不泄漏为 DOM 属性', () => {
    const { container } = render(
      <Collapsible forceMount>
        <Collapsible.Trigger>切换</Collapsible.Trigger>
        <Collapsible.Content forceMount>内容</Collapsible.Content>
      </Collapsible>,
    );
    const region = screen.getByText('内容').closest('section');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('data-state', 'closed');
    // forceMount 不应作为非法属性透传到 div / section。
    const root = container.querySelector('.ms-collapsible');
    expect(root).not.toHaveAttribute('forcemount');
    expect(region).not.toHaveAttribute('forcemount');
  });
});
