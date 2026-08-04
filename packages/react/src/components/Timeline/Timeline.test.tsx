// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { parseCssRules, targetCompound } from '../../testing/cssRules';
import { Timeline, TimelineItem } from './Timeline';

describe('Timeline + TimelineItem', () => {
  it('渲染语义化 <ol> 与 <li> 条目,带基础类名', () => {
    const { container } = render(
      <Timeline aria-label="动态">
        <TimelineItem title="创建">内容 A</TimelineItem>
        <TimelineItem title="更新">内容 B</TimelineItem>
      </Timeline>,
    );
    const ol = container.querySelector('ol.ms-timeline');
    expect(ol).toBeInTheDocument();
    expect(ol?.tagName).toBe('OL');
    expect(container.querySelectorAll('li.ms-timeline__item')).toHaveLength(2);
  });

  it('标题 / 时间 / 正文渲染到对应元素,time 为 <time>', () => {
    render(
      <Timeline>
        <TimelineItem title="部署上线" time="2026-06-25 10:00">
          已发布到生产环境
        </TimelineItem>
      </Timeline>,
    );
    expect(screen.getByText('部署上线')).toHaveClass('ms-timeline__title');
    const time = screen.getByText('2026-06-25 10:00');
    expect(time.tagName).toBe('TIME');
    expect(screen.getByText('已发布到生产环境')).toHaveClass('ms-timeline__body');
  });

  it('变体经 tone resolver 上色(ms-tone-* + toned);default 不上色', () => {
    const { container } = render(
      <Timeline>
        <TimelineItem variant="success" title="成功" />
        <TimelineItem variant="danger" title="失败" />
        <TimelineItem variant="accent" title="强调" />
        <TimelineItem title="普通" />
      </Timeline>,
    );
    const items = container.querySelectorAll('.ms-timeline__item');
    expect(items[0]).toHaveClass('ms-timeline__item--toned', 'ms-tone-success');
    expect(items[1]).toHaveClass('ms-timeline__item--toned', 'ms-tone-danger');
    expect(items[2]).toHaveClass('ms-timeline__item--toned', 'ms-tone-accent');
    expect(items[3]?.className).not.toMatch(/ms-tone-/);
    expect(items[3]?.className).not.toMatch(/--toned/);
  });

  it('默认渲染圆点;提供 icon 时以图标节点替代', () => {
    const { container } = render(
      <Timeline>
        <TimelineItem title="默认点" />
        <TimelineItem title="图标" icon={<span>★</span>} />
      </Timeline>,
    );
    const items = container.querySelectorAll('.ms-timeline__item');
    expect(items[0]?.querySelector('.ms-timeline__dot')).toBeInTheDocument();
    expect(items[0]?.querySelector('.ms-timeline__icon')).toBeNull();
    expect(items[1]?.querySelector('.ms-timeline__icon')).toBeInTheDocument();
    expect(items[1]?.querySelector('.ms-timeline__dot')).toBeNull();
  });

  it('仅正文(无 title/time)时不渲染 header', () => {
    const { container } = render(
      <Timeline>
        <TimelineItem>只有正文</TimelineItem>
      </Timeline>,
    );
    expect(container.querySelector('.ms-timeline__header')).toBeNull();
    expect(screen.getByText('只有正文')).toHaveClass('ms-timeline__body');
  });

  it('合并外部 className 并透传原生属性', () => {
    const { container } = render(
      <Timeline>
        <TimelineItem className="custom" title="x" data-testid="it" />
      </Timeline>,
    );
    const li = container.querySelector('.ms-timeline__item');
    expect(li).toHaveClass('ms-timeline__item', 'custom');
    expect(li).toHaveAttribute('data-testid', 'it');
  });

  it('mode / reverse / lineStyle 落到容器类名', () => {
    const { container, rerender } = render(
      <Timeline mode="alternate" reverse lineStyle="dashed">
        <TimelineItem title="a" />
      </Timeline>,
    );
    const ol = container.querySelector('ol.ms-timeline');
    expect(ol).toHaveClass('ms-timeline--alternate', 'ms-timeline--reverse', 'ms-timeline--dashed');

    rerender(
      <Timeline mode="right">
        <TimelineItem title="a" />
      </Timeline>,
    );
    expect(container.querySelector('ol.ms-timeline')).toHaveClass('ms-timeline--right');
  });

  it('暴露 .ms-timeline__line 连线节点(供 className 钩子定制)', () => {
    const { container } = render(
      <Timeline>
        <TimelineItem title="a" />
        <TimelineItem title="b" />
      </Timeline>,
    );
    expect(container.querySelectorAll('.ms-timeline__line')).toHaveLength(2);
  });

  it('pending 末节点也带连线元素(reverse 时它是视觉首项,连线归它自己画)', () => {
    const { container } = render(
      <Timeline reverse pending="加载更多…">
        <TimelineItem title="a" />
      </Timeline>,
    );
    const pending = container.querySelector('.ms-timeline__item--pending');
    expect(pending?.querySelector('.ms-timeline__node > .ms-timeline__line')).toBeInTheDocument();
  });

  it('pending 追加进行中末节点(呼吸圆点);false 不渲染', () => {
    const { container, rerender } = render(
      <Timeline pending="加载更多…">
        <TimelineItem title="a" />
      </Timeline>,
    );
    expect(container.querySelector('.ms-timeline__item--pending')).toBeInTheDocument();
    expect(container.querySelector('.ms-timeline__dot--pulse')).toBeInTheDocument();
    expect(screen.getByText('加载更多…')).toBeInTheDocument();

    rerender(
      <Timeline pending={false}>
        <TimelineItem title="a" />
      </Timeline>,
    );
    expect(container.querySelector('.ms-timeline__item--pending')).toBeNull();
  });

  it('pulse 给圆点加呼吸类', () => {
    const { container } = render(
      <Timeline>
        <TimelineItem title="进行中" pulse />
      </Timeline>,
    );
    expect(container.querySelector('.ms-timeline__dot--pulse')).toBeInTheDocument();
  });

  it('interactive / onSelect:条目可聚焦、active 标记 aria-current', () => {
    const { container } = render(
      <Timeline>
        <TimelineItem title="可选" onSelect={() => {}} active />
      </Timeline>,
    );
    const li = container.querySelector('.ms-timeline__item');
    expect(li).toHaveClass('ms-timeline__item--interactive', 'ms-timeline__item--active');
    expect(li).toHaveAttribute('tabindex', '0');
    expect(li).toHaveAttribute('aria-current', 'true');
  });

  it('onClick 与内部 onSelect 都触发(compose,不覆盖用户处理器)', () => {
    const onClick = vi.fn();
    const onSelect = vi.fn();
    const { container } = render(
      <Timeline>
        <TimelineItem title="点我" onClick={onClick} onSelect={onSelect} />
      </Timeline>,
    );
    const li = container.querySelector('.ms-timeline__item') as HTMLLIElement;
    fireEvent.click(li);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('用户 onClick preventDefault 可阻断内部 onSelect', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Timeline>
        <TimelineItem title="拦截" onClick={(e) => e.preventDefault()} onSelect={onSelect} />
      </Timeline>,
    );
    const li = container.querySelector('.ms-timeline__item') as HTMLLIElement;
    fireEvent.click(li);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('键盘 Enter / Space 触发 onSelect(交互式)', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Timeline>
        <TimelineItem title="键盘" onSelect={onSelect} />
      </Timeline>,
    );
    const li = container.querySelector('.ms-timeline__item') as HTMLLIElement;
    fireEvent.keyDown(li, { key: 'Enter' });
    fireEvent.keyDown(li, { key: ' ' });
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('非交互条目透传 onClick 但不加 tabindex / interactive 类', () => {
    const onClick = vi.fn();
    const { container } = render(
      <Timeline>
        <TimelineItem title="纯透传" onClick={onClick} />
      </Timeline>,
    );
    const li = container.querySelector('.ms-timeline__item') as HTMLLIElement;
    expect(li).not.toHaveClass('ms-timeline__item--interactive');
    expect(li).not.toHaveAttribute('tabindex');
    fireEvent.click(li);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Timeline 根透传原生属性与事件', () => {
    const onMouseEnter = vi.fn();
    const { container } = render(
      <Timeline data-testid="tl" onMouseEnter={onMouseEnter}>
        <TimelineItem title="a" />
      </Timeline>,
    );
    const ol = container.querySelector('ol.ms-timeline') as HTMLOListElement;
    expect(ol).toHaveAttribute('data-testid', 'tl');
    fireEvent.mouseEnter(ol);
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });
});

/* —— 连线贯通的 CSS 静态红线 ——
 * 连线是纯布局产物,jsdom 不排版也不解析 CSS,只能靠静态扫源文件守住已经踩过的两个坑。
 * 判据走真实 CSS 解析而不是正则:正则版曾经三种真回归全都检不出(归属整体对调、
 * 间距规则被删、间距搬到带修饰符的选择器上),给的是虚假安全感。 */
describe('Timeline 连线契约(静态解析 CSS)', () => {
  const rules = parseCssRules(readFileSync(join(import.meta.dirname, 'Timeline.css'), 'utf8'));
  /** 命中「目标元素是 sel」的全部规则(不管前面挂了多少祖先 / 修饰符)。 */
  const rulesTargeting = (sel: string) =>
    rules.filter((r) => r.branches.some((b) => targetCompound(b) === sel));
  /** 剥掉 :not(...) 内容,用来判断「作用域」而不是「被排除项」。 */
  const stripNot = (branch: string) => branch.replace(/:not\([^)]*\)/g, '');

  it('条目间距只能挂在 .ms-timeline__content —— 写到 li 上节点列就撑不满,连线断在间距处', () => {
    const itemRules = rulesTargeting('.ms-timeline__item');
    // 找不到就是解析或结构变了,必须显式失败,不能静默退化成恒真
    expect(itemRules.length).toBeGreaterThan(0);
    const offenders = itemRules
      .filter((r) => r.decls.some((d) => /^padding(-block(-end)?)?$/.test(d.prop)))
      .map((r) => `${r.line}: ${r.selector}`);
    expect(offenders).toEqual([]);

    const gapCarrier = rulesTargeting('.ms-timeline__content').find((r) =>
      r.decls.some((d) => d.prop === 'padding-block-end' && d.value.includes('--ms-tl-gap')),
    );
    expect(
      gapCarrier,
      '.ms-timeline__content 必须用 padding-block-end: var(--ms-tl-gap) 撑出条目间距',
    ).toBeDefined();
  });

  it('连线显隐必须按 reverse 成对 —— column-reverse 下 DOM 末项才是视觉首项', () => {
    const showRule = rules.find(
      (r) =>
        r.branches.every((b) => targetCompound(b) === '.ms-timeline__line') &&
        r.decls.some((d) => d.prop === 'display' && d.value === 'block'),
    );
    expect(showRule, '找不到把连线设为 display: block 的规则').toBeDefined();
    if (!showRule) return;
    expect(showRule.branches).toHaveLength(2);

    const reverseBranch = showRule.branches.find((b) =>
      stripNot(b).includes('.ms-timeline--reverse'),
    );
    const forwardBranch = showRule.branches.find((b) => b.includes(':not(.ms-timeline--reverse)'));
    expect(reverseBranch, 'reverse 作用域分支缺失').toBeDefined();
    expect(forwardBranch, '正序作用域分支缺失').toBeDefined();
    expect(reverseBranch).not.toBe(forwardBranch);

    // 正序:除 DOM 末项外都画;反向:视觉顺序翻转,改为除 DOM 首项外都画
    expect(forwardBranch).toContain(':not(:last-child)');
    expect(forwardBranch).not.toContain(':not(:first-child)');
    expect(reverseBranch).toContain(':not(:first-child)');
    expect(reverseBranch).not.toContain(':not(:last-child)');
  });
});
