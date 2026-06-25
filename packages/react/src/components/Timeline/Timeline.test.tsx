// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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

  it('变体加节点类名;default 不加', () => {
    const { container } = render(
      <Timeline>
        <TimelineItem variant="success" title="成功" />
        <TimelineItem variant="danger" title="失败" />
        <TimelineItem title="普通" />
      </Timeline>,
    );
    const items = container.querySelectorAll('.ms-timeline__item');
    expect(items[0]).toHaveClass('ms-timeline__item--success');
    expect(items[1]).toHaveClass('ms-timeline__item--danger');
    expect(items[2]?.className).not.toMatch(/ms-timeline__item--/);
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
});
