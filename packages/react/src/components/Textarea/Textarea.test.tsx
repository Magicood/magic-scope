// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { computeAutosizeHeight, detectSubmitIntent, resolveAutosize } from './logic';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('默认渲染为 md 尺寸,带基础类名,且不设 aria-invalid', () => {
    render(<Textarea placeholder="留言" />);
    const el = screen.getByPlaceholderText('留言');

    expect(el.tagName).toBe('TEXTAREA');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('ms-textarea', 'ms-textarea--md');
    expect(el).not.toHaveClass('ms-textarea--invalid');
    expect(el).not.toHaveAttribute('aria-invalid');
  });

  it('size 变体映射到对应修饰类名', () => {
    render(<Textarea size="lg" placeholder="大号" />);
    const el = screen.getByPlaceholderText('大号');

    expect(el).toHaveClass('ms-textarea', 'ms-textarea--lg');
    expect(el).not.toHaveClass('ms-textarea--md');
  });

  it('invalid 时设置 aria-invalid 与 danger 修饰类名,根挂 ms-tone-danger', () => {
    const { container } = render(<Textarea invalid placeholder="校验失败" />);
    const el = screen.getByPlaceholderText('校验失败');

    expect(el).toHaveClass('ms-textarea--invalid');
    expect(el).toHaveAttribute('aria-invalid', 'true');
    // invalid 强制 danger:即便不传 tone,根也应是 danger
    expect(container.querySelector('.ms-textarea-wrap')).toHaveClass('ms-tone-danger');
  });

  it('tone 映射到根的 ms-tone-* 类名;invalid 覆盖为 danger', () => {
    const { container, rerender } = render(<Textarea tone="success" placeholder="成功" />);
    expect(container.querySelector('.ms-textarea-wrap')).toHaveClass('ms-tone-success');

    rerender(<Textarea tone="success" invalid placeholder="成功" />);
    const root = container.querySelector('.ms-textarea-wrap');
    expect(root).toHaveClass('ms-tone-danger');
    expect(root).not.toHaveClass('ms-tone-success');
  });

  it('className 挂根容器,classNames.textarea 挂原生框,原生 props 透传', () => {
    render(
      <Textarea
        className="custom-cls"
        classNames={{ textarea: 'inner-cls' }}
        defaultValue="hi"
        aria-label="备注"
      />,
    );
    const el = screen.getByLabelText('备注') as HTMLTextAreaElement;
    const root = el.closest('.ms-textarea-wrap');

    expect(root).toHaveClass('ms-textarea-wrap', 'custom-cls');
    expect(el).toHaveClass('ms-textarea', 'ms-textarea--md', 'inner-cls');
    expect(el).toHaveValue('hi');
  });

  it('内部 onChange 接管时仍触发用户 onChange(composeEventHandlers 合并)', () => {
    const onChange = vi.fn();
    render(<Textarea aria-label="备注" onChange={onChange} />);
    const el = screen.getByLabelText('备注') as HTMLTextAreaElement;

    fireEvent.change(el, { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    // 非受控:内部 state 同步,值落到框上
    expect(el).toHaveValue('hello');
  });

  it('showCount 显示 当前/上限,超限染 over 类', () => {
    const { container, rerender } = render(
      <Textarea showCount maxLength={5} value="abc" onChange={() => {}} aria-label="计数" />,
    );
    const count = container.querySelector('.ms-textarea__count');
    expect(count).toHaveTextContent('3/5');
    expect(count).not.toHaveClass('ms-textarea__count--over');

    // maxLength 是软上限演示:受控值超过时染 over
    rerender(
      <Textarea showCount maxLength={5} value="abcdefg" onChange={() => {}} aria-label="计数" />,
    );
    expect(container.querySelector('.ms-textarea__count')).toHaveClass('ms-textarea__count--over');
  });

  it('footer 槽渲染到底部栏', () => {
    render(<Textarea footer={<span data-testid="hint">最多 200 字</span>} aria-label="带脚注" />);
    expect(screen.getByTestId('hint')).toBeInTheDocument();
  });

  it('Enter 触发 onPressEnter,Cmd+Enter 触发 onSubmitShortcut,且用户 onKeyDown 也触发', () => {
    const onPressEnter = vi.fn();
    const onSubmitShortcut = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Textarea
        aria-label="聊天"
        onPressEnter={onPressEnter}
        onSubmitShortcut={onSubmitShortcut}
        onKeyDown={onKeyDown}
      />,
    );
    const el = screen.getByLabelText('聊天') as HTMLTextAreaElement;

    fireEvent.keyDown(el, { key: 'Enter' });
    expect(onPressEnter).toHaveBeenCalledTimes(1);
    expect(onSubmitShortcut).not.toHaveBeenCalled();

    fireEvent.keyDown(el, { key: 'Enter', metaKey: true });
    expect(onSubmitShortcut).toHaveBeenCalledTimes(1);
    expect(onPressEnter).toHaveBeenCalledTimes(1); // Cmd+Enter 不算裸 Enter

    // Shift+Enter(换行)不触发任何提交
    fireEvent.keyDown(el, { key: 'Enter', shiftKey: true });
    expect(onPressEnter).toHaveBeenCalledTimes(1);

    // 用户 onKeyDown 每次都触发(compose 合并,未被内部覆盖)
    expect(onKeyDown).toHaveBeenCalledTimes(3);
  });

  it('autosize 时禁手动 resize 并加 autosize 修饰类', () => {
    render(<Textarea autosize aria-label="自增" />);
    const el = screen.getByLabelText('自增');
    expect(el).toHaveClass('ms-textarea--autosize');
  });
});

describe('Textarea/logic 纯函数', () => {
  it('resolveAutosize 归一化', () => {
    expect(resolveAutosize(false)).toBeNull();
    expect(resolveAutosize(undefined)).toBeNull();
    expect(resolveAutosize(true)).toEqual({});
    expect(resolveAutosize({ minRows: 2, maxRows: 6 })).toEqual({ minRows: 2, maxRows: 6 });
  });

  it('computeAutosizeHeight 受 min/max 行数限幅', () => {
    const metrics = { lineHeight: 20, verticalExtra: 10 };
    // 自由增长:scrollHeight + verticalExtra
    expect(computeAutosizeHeight(100, metrics, {})).toEqual({ height: 110, overflow: false });
    // 不足 minRows:抬到 min(3*20+10=70)
    expect(computeAutosizeHeight(40, metrics, { minRows: 3 })).toEqual({
      height: 70,
      overflow: false,
    });
    // 超 maxRows:封顶 max(4*20+10=90)并标记 overflow
    expect(computeAutosizeHeight(300, metrics, { maxRows: 4 })).toEqual({
      height: 90,
      overflow: true,
    });
  });

  it('detectSubmitIntent 识别提交意图,IME 组合中不触发', () => {
    expect(
      detectSubmitIntent({
        key: 'Enter',
        shiftKey: false,
        metaKey: false,
        ctrlKey: false,
        altKey: false,
      }),
    ).toEqual({ pressEnter: true, submitShortcut: false });
    expect(
      detectSubmitIntent({
        key: 'Enter',
        shiftKey: false,
        metaKey: true,
        ctrlKey: false,
        altKey: false,
      }),
    ).toEqual({ pressEnter: false, submitShortcut: true });
    expect(
      detectSubmitIntent({
        key: 'Enter',
        shiftKey: true,
        metaKey: false,
        ctrlKey: false,
        altKey: false,
      }),
    ).toEqual({ pressEnter: false, submitShortcut: false });
    // IME 组合中的 Enter 不算提交
    expect(
      detectSubmitIntent({
        key: 'Enter',
        shiftKey: false,
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        isComposing: true,
      }),
    ).toEqual({ pressEnter: false, submitShortcut: false });
    // 非 Enter 键
    expect(
      detectSubmitIntent({
        key: 'a',
        shiftKey: false,
        metaKey: false,
        ctrlKey: false,
        altKey: false,
      }),
    ).toEqual({ pressEnter: false, submitShortcut: false });
  });
});
