// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TagInput } from './TagInput';

/** 在输入框键入文本(走 change,让组件内部 draft 同步)。 */
function type(input: HTMLInputElement, text: string) {
  fireEvent.change(input, { target: { value: text } });
}

describe('TagInput', () => {
  it('渲染 role=group 容器 + role=combobox 输入框,带尺寸/tone 类名', () => {
    render(<TagInput aria-label="标签" size="lg" placeholder="加标签" />);
    const group = screen.getByRole('group', { name: '标签' });
    expect(group).toHaveClass('ms-tag-input', 'ms-tag-input--lg', 'ms-tone-primary');
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input).toHaveAttribute('placeholder', '加标签');
  });

  it('非受控 defaultValue 渲染初始标签', () => {
    render(<TagInput defaultValue={['react', 'vue']} aria-label="标签" />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('vue')).toBeInTheDocument();
  });

  it('回车把当前输入转成标签并清空输入,触发 onChange', () => {
    const onChange = vi.fn();
    render(<TagInput onChange={onChange} aria-label="标签" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    type(input, 'react');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['react']);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(input.value).toBe('');
  });

  it('默认逗号分隔符提交标签', () => {
    const onChange = vi.fn();
    render(<TagInput onChange={onChange} aria-label="标签" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    type(input, 'alpha');
    fireEvent.keyDown(input, { key: ',' });
    expect(onChange).toHaveBeenCalledWith(['alpha']);
  });

  it('空输入按 Backspace 删除最后一个标签', () => {
    const onChange = vi.fn();
    render(<TagInput defaultValue={['a', 'b', 'c']} onChange={onChange} aria-label="标签" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    // jsdom 下空 input 的 selectionStart 默认 0;draft 为空
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('默认拒绝重复标签(大小写不敏感),走 onReject', () => {
    const onChange = vi.fn();
    const onReject = vi.fn();
    render(
      <TagInput
        defaultValue={['React']}
        onChange={onChange}
        onReject={onReject}
        aria-label="标签"
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    type(input, 'react');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledWith('react', 'duplicate');
  });

  it('allowDuplicates 放行重复标签', () => {
    const onChange = vi.fn();
    render(<TagInput defaultValue={['x']} allowDuplicates onChange={onChange} aria-label="标签" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    type(input, 'x');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['x', 'x']);
  });

  it('maxTags 达上限后输入只读,无法新增', () => {
    render(<TagInput defaultValue={['a', 'b']} maxTags={2} aria-label="标签" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input).toHaveAttribute('readonly');
    expect(screen.getByRole('group')).toHaveClass('ms-tag-input--full');
  });

  it('validate 返回 false 拒绝加入,走 onReject(invalid)', () => {
    const onChange = vi.fn();
    const onReject = vi.fn();
    render(
      <TagInput
        validate={(t) => t.length >= 3}
        onChange={onChange}
        onReject={onReject}
        aria-label="标签"
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    type(input, 'ab');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledWith('ab', 'invalid');
  });

  it('点标签移除按钮删除该标签,触发 onRemoveTag 与 onChange', () => {
    const onChange = vi.fn();
    const onRemoveTag = vi.fn();
    render(
      <TagInput
        defaultValue={['a', 'b']}
        onChange={onChange}
        onRemoveTag={onRemoveTag}
        aria-label="标签"
      />,
    );
    // 移除按钮 aria-label 走 i18n tag.remove(移除: a)
    const removeBtn = screen.getByRole('button', { name: /a/ });
    fireEvent.click(removeBtn);
    expect(onRemoveTag).toHaveBeenCalledWith('a', 0);
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('受控模式:不传 onChange 不自更新,传入新 value 才变', () => {
    function Controlled() {
      const [v, setV] = useState<string[]>(['one']);
      return <TagInput value={v} onChange={setV} aria-label="标签" />;
    }
    render(<Controlled />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    type(input, 'two');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('two')).toBeInTheDocument();
    expect(screen.getByText('one')).toBeInTheDocument();
  });

  it('粘贴含分隔符的文本一次性切分多标签', () => {
    const onChange = vi.fn();
    render(<TagInput onChange={onChange} aria-label="标签" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.paste(input, {
      clipboardData: { getData: () => 'a, b, c' },
    });
    expect(onChange).toHaveBeenCalledWith(['a', 'b', 'c']);
  });

  it('addOnBlur:失焦把残留输入提交为标签', () => {
    const onChange = vi.fn();
    render(<TagInput addOnBlur onChange={onChange} aria-label="标签" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    type(input, 'lone');
    fireEvent.blur(input, { relatedTarget: document.body });
    expect(onChange).toHaveBeenCalledWith(['lone']);
  });

  it('invalid 设置 aria-invalid 并染 invalid 类', () => {
    render(<TagInput invalid aria-label="标签" />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('group')).toHaveClass('ms-tag-input--invalid', 'ms-tone-danger');
  });

  it('disabled:输入框禁用且容器 aria-disabled', () => {
    render(<TagInput disabled defaultValue={['x']} aria-label="标签" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input).toBeDisabled();
    expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true');
  });

  it('clearable:有标签时显示清空按钮,点击清空全部', () => {
    const onChange = vi.fn();
    render(<TagInput defaultValue={['a', 'b']} clearable onChange={onChange} aria-label="标签" />);
    const clearBtn = screen.getByRole('button', { name: '清除' });
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('renderTag 留口:完全自绘标签', () => {
    render(
      <TagInput
        defaultValue={['solo']}
        renderTag={({ value, index }) => (
          <span key={index} data-testid="custom-tag">
            #{value}
          </span>
        )}
        aria-label="标签"
      />,
    );
    expect(screen.getByTestId('custom-tag')).toHaveTextContent('#solo');
  });

  it('空白处输入(纯空格)回车不新增标签', () => {
    const onChange = vi.fn();
    render(<TagInput onChange={onChange} aria-label="标签" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    type(input, '   ');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  // ── 回归:#1 IME 组合态 Enter 不提交 ─────────────────────────────
  it('IME 组合中(isComposing)按 Enter 不提交标签,放行选词', () => {
    const onChange = vi.fn();
    render(<TagInput onChange={onChange} aria-label="标签" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    type(input, 'react');
    // 中文/日文选词确认发的 Enter:nativeEvent.isComposing=true
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(onChange).not.toHaveBeenCalled();
    // draft 未被吞,仍在输入框
    expect(input.value).toBe('react');
    // 组合结束后再按裸 Enter 才提交
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['react']);
  });

  it('IME 组合态(keyCode 229)的 Enter 同样不提交', () => {
    const onChange = vi.fn();
    render(<TagInput onChange={onChange} aria-label="标签" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    type(input, '中文');
    // 部分浏览器只给 keyCode 229,不给 isComposing
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('中文');
  });

  // ── 回归:#2 renderTag 不写 key 也不报「missing key」警告 ──────────
  it('renderTag 不自写 key 时组件自供 key,不产生 React key 警告', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <TagInput
        defaultValue={['a', 'b', 'c']}
        // 注意:故意不在返回节点上写 key —— key 由组件负责
        renderTag={({ value }) => <span data-testid="rt">{value}</span>}
        aria-label="标签"
      />,
    );
    expect(screen.getAllByTestId('rt')).toHaveLength(3);
    const keyWarning = errorSpy.mock.calls.some((args) =>
      String(args[0]).includes('unique "key" prop'),
    );
    expect(keyWarning).toBe(false);
    errorSpy.mockRestore();
  });

  // ── 回归:#3 renderTag 模式下 context.ref 接上后参与 ← 标签键盘导航 ──
  it('renderTag 模式:挂了 context.ref 的自绘标签可被 ← 聚焦(进入标签导航)', () => {
    render(
      <TagInput
        defaultValue={['x', 'y']}
        renderTag={({ value, ref, onRemove }) => (
          <button type="button" ref={ref} data-testid={`rt-${value}`} onClick={onRemove}>
            {value}
          </button>
        )}
        aria-label="标签"
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    input.focus();
    // 光标在最前按 ←:焦点应落到最后一个自绘标签(y)
    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    expect(screen.getByTestId('rt-y')).toHaveFocus();
  });

  // ── 回归:#4 多字符分隔符在「键入」路径也能切分(非仅粘贴) ────────
  it('多字符分隔符 :: 键入即触发成标签(键入路径)', () => {
    const onChange = vi.fn();
    render(<TagInput delimiter="::" onChange={onChange} aria-label="标签" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    // 逐字键入到打出末尾的 '::':onChange 检测后缀命中并切分
    type(input, 'react::');
    expect(onChange).toHaveBeenCalledWith(['react']);
    // 分隔符之后的残余(空)留在输入框
    expect(input.value).toBe('');
  });

  it('多字符分隔符命中后保留分隔符之后的残余文本', () => {
    const onChange = vi.fn();
    render(<TagInput delimiter="||" onChange={onChange} aria-label="标签" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    type(input, 'foo||');
    expect(onChange).toHaveBeenCalledWith(['foo']);
    expect(input.value).toBe('');
  });

  // ── 回归:#5 粘贴被全部拒掉时不吞用户已有草稿 ──────────────────────
  it('粘贴内容全部被去重拒掉时,保留输入框已有草稿', () => {
    const onChange = vi.fn();
    render(<TagInput defaultValue={['a', 'b']} onChange={onChange} aria-label="标签" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    // 已有未提交草稿
    type(input, 'foo');
    expect(input.value).toBe('foo');
    // 粘贴含分隔符但全是已存在标签(a,b),addMany 不新增
    fireEvent.paste(input, {
      clipboardData: { getData: () => 'a,b' },
    });
    expect(onChange).not.toHaveBeenCalled();
    // 草稿不被吞
    expect(input.value).toBe('foo');
  });

  it('粘贴确有新增时仍清空草稿', () => {
    const onChange = vi.fn();
    render(<TagInput defaultValue={['a']} onChange={onChange} aria-label="标签" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    type(input, 'foo');
    // 含新标签 c:有净变化,应清空草稿
    fireEvent.paste(input, {
      clipboardData: { getData: () => 'a,c' },
    });
    expect(onChange).toHaveBeenCalledWith(['a', 'c']);
    expect(input.value).toBe('');
  });
});
