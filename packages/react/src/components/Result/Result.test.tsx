// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Result } from './Result';

describe('Result', () => {
  it('默认 info:基础类名 + 尺寸/状态/tone 类,渲染默认图标', () => {
    const { container } = render(<Result title="提示" />);
    const root = container.querySelector('.ms-result');
    expect(root).toHaveClass(
      'ms-result',
      'ms-result--md',
      'ms-result--status-info',
      'ms-tone-info',
    );
    expect(container.querySelector('.ms-result__title')).toHaveTextContent('提示');
    // 默认图标字符(info → ℹ)
    expect(container.querySelector('.ms-result__glyph')).toHaveTextContent('ℹ');
  });

  it('status → tone 自动联动(success→success、error→danger、403→warning)', () => {
    const { container, rerender } = render(<Result status="success" title="成功" />);
    expect(container.querySelector('.ms-result')).toHaveClass(
      'ms-result--status-success',
      'ms-tone-success',
    );

    rerender(<Result status="error" title="失败" />);
    expect(container.querySelector('.ms-result')).toHaveClass(
      'ms-result--status-error',
      'ms-tone-danger',
    );

    rerender(<Result status="403" />);
    expect(container.querySelector('.ms-result')).toHaveClass(
      'ms-result--status-403',
      'ms-tone-warning',
    );
  });

  it('tone prop 覆盖 status 派生的默认 tone', () => {
    const { container } = render(<Result status="success" tone="accent" title="自定义" />);
    const root = container.querySelector('.ms-result');
    expect(root).toHaveClass('ms-result--status-success', 'ms-tone-accent');
    expect(root).not.toHaveClass('ms-tone-success');
  });

  it('HTTP 异常:默认数字码 + 默认标题兜底,title 可覆盖', () => {
    const { container, rerender } = render(<Result status="404" />);
    // 默认图标为数字码,带 --code 修饰类
    expect(container.querySelector('.ms-result__icon')).toHaveClass('ms-result__icon--code');
    expect(container.querySelector('.ms-result__glyph')).toHaveTextContent('404');
    // 默认标题兜底
    expect(container.querySelector('.ms-result__title')).toHaveTextContent('页面不存在');

    rerender(<Result status="404" title="找不到啦" />);
    expect(container.querySelector('.ms-result__title')).toHaveTextContent('找不到啦');
  });

  it('自定义 icon 覆盖默认图标;icon={false} 关闭整个图标区', () => {
    const { container, rerender } = render(
      <Result status="success" icon={<svg data-testid="custom-svg" />} title="带 SVG" />,
    );
    expect(screen.getByTestId('custom-svg')).toBeInTheDocument();
    expect(container.querySelector('.ms-result__glyph')).toHaveTextContent('');

    rerender(<Result status="success" icon={false} title="无图标" />);
    expect(container.querySelector('.ms-result__icon')).not.toBeInTheDocument();
  });

  it('渲染 subtitle / extra / children 四槽位,并支持 classNames 细粒度类', () => {
    const { container } = render(
      <Result
        status="error"
        title="出错了"
        subtitle="请稍后重试"
        extra={<button type="button">重试</button>}
        classNames={{
          root: 'x-root',
          icon: 'x-icon',
          title: 'x-title',
          subtitle: 'x-sub',
          content: 'x-content',
          extra: 'x-extra',
        }}
      >
        补充说明
      </Result>,
    );
    expect(container.querySelector('.ms-result__subtitle')).toHaveTextContent('请稍后重试');
    expect(container.querySelector('.ms-result__extra')).toHaveTextContent('重试');
    expect(container.querySelector('.ms-result__content')).toHaveTextContent('补充说明');
    expect(container.querySelector('.ms-result')).toHaveClass('x-root');
    expect(container.querySelector('.ms-result__icon')).toHaveClass('x-icon');
    expect(container.querySelector('.ms-result__title')).toHaveClass('x-title');
    expect(container.querySelector('.ms-result__subtitle')).toHaveClass('x-sub');
    expect(container.querySelector('.ms-result__content')).toHaveClass('x-content');
    expect(container.querySelector('.ms-result__extra')).toHaveClass('x-extra');
  });

  it('多态 as 改根标签;透传原生属性与 onClick;转发 ref', () => {
    const handleClick = vi.fn();
    const ref = vi.fn();
    const { container } = render(
      <Result as="section" id="r" data-testid="res" onClick={handleClick} ref={ref} title="多态" />,
    );
    const root = container.querySelector('section.ms-result');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('id', 'r');
    expect(root).toHaveAttribute('data-testid', 'res');
    fireEvent.click(root as Element);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledTimes(1);
  });

  it('asChild 把样式合并到子元素,内部结构槽位不渲染', () => {
    const { container } = render(
      <Result status="warning" asChild className="extra" title="忽略的标题">
        <article>自带内容</article>
      </Result>,
    );
    const el = container.querySelector('article');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('ms-result', 'ms-result--status-warning', 'ms-tone-warning', 'extra');
    expect(el).toHaveTextContent('自带内容');
    // asChild 模式不渲染内部结构(title 槽位不出现)
    expect(container.querySelector('.ms-result__title')).not.toBeInTheDocument();
  });
});
