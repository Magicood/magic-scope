// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { Ref } from 'react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Editable } from './Editable';

// jsdom 不实现 requestAnimationFrame 的真实时序,但全局存在;焦点回收用它,测试里同步触发即可。
describe('Editable', () => {
  it('展示态渲染为 role=button,显示值并带组件基础 / tone / size 类名', () => {
    const { container } = render(<Editable defaultValue="魔法" tone="success" size="lg" />);
    const root = container.querySelector('.ms-editable');
    expect(root).toHaveClass('ms-editable--lg');
    expect(root).toHaveClass('ms-tone-success');
    const preview = screen.getByRole('button');
    expect(preview).toHaveTextContent('魔法');
    expect(preview).toHaveClass('ms-editable__preview');
  });

  it('空值时展示态显示 placeholder,并打 data-empty / 空态类名', () => {
    const { container } = render(<Editable placeholder="点击编辑" />);
    const preview = screen.getByRole('button');
    expect(preview).toHaveTextContent('点击编辑');
    expect(preview).toHaveAttribute('data-empty');
    expect(container.querySelector('.ms-editable')).toHaveClass('ms-editable--empty');
  });

  it('点击展示态进入编辑态,渲染 input 并自动聚焦,带 aria-label', () => {
    render(<Editable defaultValue="原值" inputAriaLabel="编辑标题" />);
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox', { name: '编辑标题' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('原值');
    expect(input).toHaveFocus();
  });

  it('Enter 提交:值变化时回调 onChange、退出编辑、非受控落库', () => {
    const onChange = vi.fn();
    render(<Editable defaultValue="a" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('ab');
    // 退出编辑态,展示态显示新值
    expect(screen.getByRole('button')).toHaveTextContent('ab');
  });

  it('Enter 提交但值未变化时不触发 onChange', () => {
    const onChange = vi.fn();
    render(<Editable defaultValue="same" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveTextContent('same');
  });

  it('Esc 取消:还原初值、回调 onCancel、不触发 onChange', () => {
    const onChange = vi.fn();
    const onCancel = vi.fn();
    render(<Editable defaultValue="原" onChange={onChange} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '改了' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledWith('原');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveTextContent('原');
  });

  it('失焦默认提交(submitOnBlur);submitOnBlur=false 时失焦取消还原', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Editable defaultValue="x" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'xy' } });
    fireEvent.blur(screen.getByRole('textbox'));
    expect(onChange).toHaveBeenCalledWith('xy');

    onChange.mockClear();
    rerender(<Editable defaultValue="x" onChange={onChange} submitOnBlur={false} />);
    // 重新进入编辑
    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'zzz' } });
    fireEvent.blur(screen.getByRole('textbox'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('多行 multiline 渲染 textarea;Shift+Enter 不提交、裸 Enter 默认也不提交', () => {
    const onChange = vi.fn();
    render(<Editable defaultValue="行" multiline onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    const textarea = screen.getByRole('textbox');
    expect(textarea.tagName).toBe('TEXTAREA');
    fireEvent.change(textarea, { target: { value: '行2' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    // 多行裸 Enter 默认换行,不提交
    expect(onChange).not.toHaveBeenCalled();
    // 仍处于编辑态
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('受控编辑态:editing + onEditingChange 双通道(内部不自行切换)', () => {
    const onEditingChange = vi.fn();
    const { rerender } = render(
      <Editable defaultValue="v" editing={false} onEditingChange={onEditingChange} />,
    );
    fireEvent.click(screen.getByRole('button'));
    // 受控:点击只回调,不自切到编辑态
    expect(onEditingChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    // 父级回灌 editing=true 后才渲染编辑态
    rerender(<Editable defaultValue="v" editing={true} onEditingChange={onEditingChange} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('startWithEditView 初次即编辑态;selectAllOnFocus 进入时全选', () => {
    render(<Editable defaultValue="选我" startWithEditView selectAllOnFocus />);
    const input = screen.getByRole<HTMLInputElement>('textbox');
    expect(input).toHaveFocus();
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe('选我'.length);
  });

  it('disabled:展示态按钮禁用,点击不进入编辑态', () => {
    render(<Editable defaultValue="禁" disabled />);
    const preview = screen.getByRole('button');
    expect(preview).toBeDisabled();
    fireEvent.click(preview);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('invalid 染 danger 环并给编辑态 input 设 aria-invalid', () => {
    const { container } = render(<Editable defaultValue="e" invalid startWithEditView />);
    expect(container.querySelector('.ms-editable')).toHaveClass('ms-tone-danger');
    expect(container.querySelector('.ms-editable')).toHaveClass('ms-editable--invalid');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('maxLength 透传输入元素并在提交时截断', () => {
    const onChange = vi.fn();
    render(<Editable defaultValue="" maxLength={3} onChange={onChange} startWithEditView />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '3');
    // 直接灌 4 字模拟逻辑层截断(maxLength DOM 限制在 jsdom 下不强制)
    fireEvent.change(input, { target: { value: 'abcd' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('abc');
  });

  it('renderPreview / renderEdit 留口替换两态渲染', () => {
    render(
      <Editable
        defaultValue="原"
        renderPreview={({ text, edit }) => (
          <button type="button" onClick={edit}>
            自定义展示 {text}
          </button>
        )}
        renderEdit={({ value, setValue, submit }) => (
          <input
            aria-label="自定义编辑"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={submit}
          />
        )}
      />,
    );
    fireEvent.click(screen.getByText(/自定义展示/));
    expect(screen.getByRole('textbox', { name: '自定义编辑' })).toBeInTheDocument();
  });

  it('forwardRef 暴露根 div;透传 ...rest 的 data-* 到根', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Editable ref={ref} data-testid="ed" defaultValue="x" />);
    expect(ref.current).toBe(container.querySelector('.ms-editable'));
    expect(ref.current).toHaveAttribute('data-testid', 'ed');
  });

  it('受控 value:内部不落库,提交回调外部新值(由父级回灌)', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Editable value="受控" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '受控2' } });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('受控2');
    // 受控:未回灌前展示态仍是旧值
    expect(screen.getByRole('button')).toHaveTextContent('受控');
    rerender(<Editable value="受控2" onChange={onChange} />);
    expect(screen.getByRole('button')).toHaveTextContent('受控2');
  });

  // 回归 #1:受控编辑通道下父级直接翻 editing=false→true(不点击),
  // 原样提交不应误触发 onChange(此前 editStartValue 停留在初值 '' 导致虚假 changed)。
  it('回归#1:受控编辑通道原样提交不误触发 onChange(非受控值)', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Editable editing={false} defaultValue="A" onChange={onChange} />);
    // 父级直接渲染 editing=true(走受控编辑通道,不经 enterEdit)
    rerender(<Editable editing={true} defaultValue="A" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('A');
    // 什么都不改,Enter 提交
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  // 回归 #1 变体:失焦提交同样不应在值未变时误报。
  it('回归#1:受控编辑通道原样失焦提交不误触发 onChange', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Editable editing={false} defaultValue="A" onChange={onChange} />);
    rerender(<Editable editing={true} defaultValue="A" onChange={onChange} />);
    fireEvent.blur(screen.getByRole('textbox'));
    expect(onChange).not.toHaveBeenCalled();
  });

  // 回归 #2:受控值 + 受控编辑同时切换(一次性 setState 既给新值又开编辑),
  // 进入编辑态应展示最新值 'B',而非陈旧草稿 'A'。
  it('回归#2:受控值与受控编辑同时切换时 input 展示最新值', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Editable value="A" editing={false} onChange={onChange} />);
    rerender(<Editable value="B" editing={true} onChange={onChange} />);
    expect(screen.getByRole('textbox')).toHaveValue('B');
  });

  // 回归 #3:renderPreview 时把 render props 的 ref 接到自定义可聚焦元素上,
  // 退出编辑(Esc / 提交)后焦点应收回该元素,而非丢到 <body>。
  it('回归#3:renderPreview 接 ref 后退出编辑焦点收回自定义展示态', async () => {
    function Harness() {
      return (
        <Editable
          defaultValue="原"
          renderPreview={({ text, edit, ref }) => (
            <button type="button" ref={ref as Ref<HTMLButtonElement>} onClick={edit}>
              自定义 {text}
            </button>
          )}
        />
      );
    }
    render(<Harness />);
    const preview = screen.getByText(/自定义/);
    fireEvent.click(preview);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Escape' });
    // focusPreview 在 rAF 里回收;jsdom 下 rAF 异步,等一帧
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(screen.getByText(/自定义/)).toHaveFocus();
  });

  // 回归 #3 配套:render props 暴露 ref + invalid,供用户自管焦点回收 / 无效语义。
  it('回归#3:renderPreview render props 暴露 ref 与 invalid', () => {
    const seen: { ref: unknown; invalid: boolean }[] = [];
    render(
      <Editable
        defaultValue="x"
        invalid
        renderPreview={(p) => {
          seen.push({ ref: p.ref, invalid: p.invalid });
          return <span>{p.text}</span>;
        }}
      />,
    );
    expect(seen.length).toBeGreaterThan(0);
    const last = seen.at(-1);
    expect(last?.ref).toBeDefined();
    expect(last?.invalid).toBe(true);
  });

  // 回归 #4:invalid 且处于展示态时,默认展示态 button 也应带 aria-invalid,
  // 让校验失败态对辅助技术连续可感知(不止编辑态)。
  it('回归#4:invalid 时展示态 button 带 aria-invalid', () => {
    render(<Editable defaultValue="e" invalid />);
    const preview = screen.getByRole('button');
    expect(preview).toHaveAttribute('aria-invalid', 'true');
  });

  it('回归#4:非 invalid 时展示态 button 不带 aria-invalid(不污染语义)', () => {
    render(<Editable defaultValue="ok" />);
    const preview = screen.getByRole('button');
    expect(preview).not.toHaveAttribute('aria-invalid');
  });
});
