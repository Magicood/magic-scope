// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Empty } from './Empty';
import { EMPTY_PRESETS, isEmptyPreset } from './logic';

describe('Empty', () => {
  it('默认渲染:基础类 + 默认 size(md)/tone(neutral) 类 + i18n 描述 + 内置插画', () => {
    const { container } = render(<Empty />);
    const root = container.querySelector('.ms-empty');
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass('ms-empty--md', 'ms-tone-neutral');
    // 描述默认走 i18n empty.description = 暂无数据
    expect(container.querySelector('.ms-empty__description')).toHaveTextContent('暂无数据');
    // 未传 image → 内置 SVG 插画(装饰,aria-hidden)
    const imageSlot = container.querySelector('.ms-empty__image');
    expect(imageSlot).toBeInTheDocument();
    expect(imageSlot).toHaveAttribute('aria-hidden', 'true');
    expect(imageSlot?.querySelector('svg.ms-empty__svg')).toBeInTheDocument();
  });

  it('size 与 tone 渲染对应类名', () => {
    const { rerender, container } = render(<Empty size="lg" tone="info" />);
    const root = container.querySelector('.ms-empty');
    expect(root).toHaveClass('ms-empty--lg', 'ms-tone-info');
    expect(root).not.toHaveClass('ms-empty--md', 'ms-tone-neutral');

    rerender(<Empty size="sm" tone="danger" />);
    expect(container.querySelector('.ms-empty')).toHaveClass('ms-empty--sm', 'ms-tone-danger');
  });

  it('description 可覆盖、可用 false 关闭;image=false 关闭插画列', () => {
    const { rerender, container } = render(<Empty description="没有搜索结果" />);
    expect(container.querySelector('.ms-empty__description')).toHaveTextContent('没有搜索结果');

    rerender(<Empty description={false} image={false} />);
    expect(container.querySelector('.ms-empty__description')).not.toBeInTheDocument();
    expect(container.querySelector('.ms-empty__image')).not.toBeInTheDocument();
  });

  it('image 传预设名渲染内置 SVG;传自定义 ReactNode 原样渲染', () => {
    const { rerender, container } = render(<Empty image="simple" />);
    expect(container.querySelector('.ms-empty__image svg.ms-empty__svg')).toBeInTheDocument();

    rerender(<Empty image={<img src="/x.png" alt="自定义" data-testid="custom-img" />} />);
    // 自定义节点不再渲染内置 SVG
    expect(container.querySelector('.ms-empty__svg')).not.toBeInTheDocument();
    expect(screen.getByTestId('custom-img')).toBeInTheDocument();
  });

  it('children 渲染为底部操作区', () => {
    const { container } = render(
      <Empty>
        <button type="button">重试</button>
      </Empty>,
    );
    const footer = container.querySelector('.ms-empty__footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent('重试');
  });

  it('classNames 把细粒度类挂到对应子部件', () => {
    const { container } = render(
      <Empty
        classNames={{ root: 'x-root', image: 'x-img', description: 'x-desc', footer: 'x-foot' }}
      >
        <span>操作</span>
      </Empty>,
    );
    expect(container.querySelector('.ms-empty')).toHaveClass('x-root');
    expect(container.querySelector('.ms-empty__image')).toHaveClass('x-img');
    expect(container.querySelector('.ms-empty__description')).toHaveClass('x-desc');
    expect(container.querySelector('.ms-empty__footer')).toHaveClass('x-foot');
  });

  it('合并自定义 className、透传原生属性、转发 ref 到根', () => {
    const ref = vi.fn();
    const { container } = render(
      <Empty ref={ref} className="extra" id="my-empty" data-testid="emp" />,
    );
    const root = container.querySelector('.ms-empty');
    expect(root).toHaveClass('extra');
    expect(root).toHaveAttribute('id', 'my-empty');
    expect(root).toHaveAttribute('data-testid', 'emp');
    expect(ref).toHaveBeenCalledTimes(1);
    expect(ref.mock.calls[0]?.[0]).toBeInstanceOf(HTMLDivElement);
  });

  it('多态 as 渲染指定标签并保留样式与内容结构', () => {
    const { container } = render(<Empty as="section" description="空" />);
    const root = container.querySelector('section.ms-empty');
    expect(root).toBeInTheDocument();
    expect(root?.querySelector('.ms-empty__description')).toHaveTextContent('空');
  });

  it('asChild 把样式合并到子元素(不额外包一层),子元素自带内容', () => {
    const { container } = render(
      <Empty asChild className="extra" tone="warning">
        <article>自带内容</article>
      </Empty>,
    );
    const el = container.querySelector('article');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('ms-empty', 'ms-tone-warning', 'extra');
    expect(el).toHaveTextContent('自带内容');
    // asChild 模式不渲染内部子部件槽位
    expect(container.querySelector('.ms-empty__image')).not.toBeInTheDocument();
  });

  it('logic：isEmptyPreset 只对合法预设名为真,EMPTY_PRESETS 含 default/simple', () => {
    expect(EMPTY_PRESETS).toEqual(['default', 'simple']);
    expect(isEmptyPreset('default')).toBe(true);
    expect(isEmptyPreset('simple')).toBe(true);
    expect(isEmptyPreset('fancy')).toBe(false);
    expect(isEmptyPreset(123)).toBe(false);
    expect(isEmptyPreset(undefined)).toBe(false);
  });
});
