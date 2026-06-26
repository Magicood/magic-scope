// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Mark } from './Mark';

describe('Mark —— 渲染', () => {
  it('命中片段包进 <mark>,未命中原样', () => {
    const { container } = render(<Mark search="world">hello world</Mark>);
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0]).toHaveTextContent('world');
    // 整体文本无丢字
    expect(container.textContent).toBe('hello world');
  });

  it('命中片段带 ms-mark__hit 与 tone 类(默认 warning)', () => {
    const { container } = render(<Mark search="x">axb</Mark>);
    const mark = container.querySelector('mark');
    expect(mark).toHaveClass('ms-mark__hit');
    expect(mark).toHaveClass('ms-tone-warning');
  });

  it('自定义 tone 反映到命中片段类名', () => {
    const { container } = render(
      <Mark search="x" tone="success">
        axb
      </Mark>,
    );
    expect(container.querySelector('mark')).toHaveClass('ms-tone-success');
  });

  it('空 search 原样返回、不产生 <mark>', () => {
    const { container } = render(<Mark search="">hello world</Mark>);
    expect(container.querySelectorAll('mark')).toHaveLength(0);
    expect(container.textContent).toBe('hello world');
  });

  it('不传 search 原样返回', () => {
    const { container } = render(<Mark>plain text</Mark>);
    expect(container.querySelectorAll('mark')).toHaveLength(0);
    expect(container.textContent).toBe('plain text');
  });

  it('多词多次命中', () => {
    const { container } = render(<Mark search={['red', 'blue']}>red green blue</Mark>);
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(2);
    expect(marks[0]).toHaveTextContent('red');
    expect(marks[1]).toHaveTextContent('blue');
  });
});

describe('Mark —— 选项透传', () => {
  it('caseSensitive 透传到逻辑', () => {
    const { container } = render(
      <Mark search="hello" caseSensitive>
        Hello hello
      </Mark>,
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0]).toHaveTextContent('hello');
  });

  it('wholeWord 透传到逻辑', () => {
    const { container } = render(
      <Mark search="cat" wholeWord>
        cat category
      </Mark>,
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0]).toHaveTextContent('cat');
  });
});

describe('Mark —— 留口 / 多态 / a11y', () => {
  it('as 多态渲染容器标签', () => {
    const { container } = render(
      <Mark as="p" search="x">
        axb
      </Mark>,
    );
    expect(container.querySelector('p.ms-mark')).toBeInTheDocument();
  });

  it('forwardRef 接到容器元素', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Mark ref={ref} search="x">
        axb
      </Mark>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current).toHaveClass('ms-mark');
  });

  it('className 与 classNames.root 都拼到容器', () => {
    const { container } = render(
      <Mark search="x" className="extern" classNames={{ root: 'slot-root' }}>
        axb
      </Mark>,
    );
    const root = container.querySelector('.ms-mark');
    expect(root).toHaveClass('extern');
    expect(root).toHaveClass('slot-root');
  });

  it('classNames.hit 拼到命中片段', () => {
    const { container } = render(
      <Mark search="x" classNames={{ hit: 'slot-hit' }}>
        axb
      </Mark>,
    );
    expect(container.querySelector('mark')).toHaveClass('slot-hit');
  });

  it('data-* 透传到容器', () => {
    const { container } = render(
      <Mark search="x" data-testid="mk">
        axb
      </Mark>,
    );
    expect(container.querySelector('[data-testid="mk"]')).toBeInTheDocument();
  });

  it('命中用语义 <mark> 元素(a11y)', () => {
    const { container } = render(<Mark search="key">a key here</Mark>);
    expect(container.querySelector('mark')?.tagName).toBe('MARK');
  });
});
