// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { type MentionOption, Mentions } from './Mentions';

const OPTIONS: MentionOption[] = [
  { value: 'alice', label: 'Alice' },
  { value: 'bob', label: 'Bob' },
  { value: 'carol', label: 'Carol' },
];

/**
 * 在 textarea 里输入文本并把光标放到末尾。
 * 先 fireEvent.change(让 React 看到值变化、触发 onChange),再把光标设到末尾并 fireEvent.click,
 * 触发组件的 handleClick → syncFromCaret 用「正确的末尾光标」重算触发段(detectMention 依赖 selectionStart)。
 */
function typeInto(el: HTMLTextAreaElement, text: string) {
  fireEvent.change(el, { target: { value: text } });
  el.selectionStart = text.length;
  el.selectionEnd = text.length;
  fireEvent.click(el);
}

describe('Mentions', () => {
  it('未输入触发前缀时不显示候选浮层', () => {
    render(<Mentions options={OPTIONS} aria-label="评论" />);
    const ta = screen.getByRole('combobox') as HTMLTextAreaElement;
    typeInto(ta, 'hello world');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(ta).toHaveAttribute('aria-expanded', 'false');
  });

  it('输入 @ 后弹出候选 listbox,aria-expanded 变 true', () => {
    render(<Mentions options={OPTIONS} aria-label="评论" />);
    const ta = screen.getByRole('combobox') as HTMLTextAreaElement;
    typeInto(ta, 'hi @');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(ta).toHaveAttribute('aria-expanded', 'true');
  });

  it('@ 后输入 query 实时过滤候选', () => {
    render(<Mentions options={OPTIONS} aria-label="评论" />);
    const ta = screen.getByRole('combobox') as HTMLTextAreaElement;
    typeInto(ta, 'hi @al');
    const opts = screen.getAllByRole('option');
    expect(opts).toHaveLength(1);
    expect(opts[0]).toHaveTextContent('Alice');
  });

  it('点击候选回填:@al → @Alice + 空格,并触发 onChange / onSelect', () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    render(
      <Mentions options={OPTIONS} onChange={onChange} onSelect={onSelect} aria-label="评论" />,
    );
    const ta = screen.getByRole('combobox') as HTMLTextAreaElement;
    typeInto(ta, 'hi @al');
    fireEvent.mouseDown(screen.getByText('Alice'));
    expect(onChange).toHaveBeenLastCalledWith('hi @Alice ');
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'alice' }), '@');
  });

  it('键盘 ArrowDown 移高亮 + Enter 选中', () => {
    const onChange = vi.fn();
    render(<Mentions options={OPTIONS} onChange={onChange} aria-label="评论" />);
    const ta = screen.getByRole('combobox') as HTMLTextAreaElement;
    typeInto(ta, '@');
    // 默认高亮第 0 项 Alice;下移到 Bob
    fireEvent.keyDown(ta, { key: 'ArrowDown' });
    fireEvent.keyDown(ta, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith('@Bob ');
  });

  it('Esc 关闭浮层但不回填', () => {
    render(<Mentions options={OPTIONS} aria-label="评论" />);
    const ta = screen.getByRole('combobox') as HTMLTextAreaElement;
    typeInto(ta, '@al');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(ta, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('无匹配候选时显示空态', () => {
    render(<Mentions options={OPTIONS} aria-label="评论" />);
    const ta = screen.getByRole('combobox') as HTMLTextAreaElement;
    typeInto(ta, '@zzz');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText('无匹配项')).toBeInTheDocument();
  });

  it('loading 时显示加载态(走 onSearch 异步路径)', () => {
    const onSearch = vi.fn();
    render(<Mentions options={[]} onSearch={onSearch} loading aria-label="评论" />);
    const ta = screen.getByRole('combobox') as HTMLTextAreaElement;
    typeInto(ta, '@a');
    expect(onSearch).toHaveBeenCalledWith('a');
    expect(screen.getByText('加载中…')).toBeInTheDocument();
  });

  it('支持多前缀:# 也触发候选', () => {
    render(<Mentions options={OPTIONS} prefix={['@', '#']} aria-label="话题" />);
    const ta = screen.getByRole('combobox') as HTMLTextAreaElement;
    typeInto(ta, 'topic #ca');
    const opts = screen.getAllByRole('option');
    expect(opts).toHaveLength(1);
    expect(opts[0]).toHaveTextContent('Carol');
  });

  it('disabled 时不弹候选', () => {
    render(<Mentions options={OPTIONS} disabled aria-label="评论" />);
    const ta = screen.getByRole('combobox') as HTMLTextAreaElement;
    expect(ta).toBeDisabled();
    typeInto(ta, '@al');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('受控模式:value 由外部驱动,onChange 反馈新文本', () => {
    function Controlled() {
      const [v, setV] = useState('');
      return <Mentions options={OPTIONS} value={v} onChange={setV} aria-label="评论" />;
    }
    render(<Controlled />);
    const ta = screen.getByRole('combobox') as HTMLTextAreaElement;
    typeInto(ta, '@bo');
    expect(ta).toHaveValue('@bo');
    fireEvent.mouseDown(screen.getByText('Bob'));
    expect(ta).toHaveValue('@Bob ');
  });

  it('首项 disabled 时初始高亮不落在禁用项(跳到首个可选项)', () => {
    const disabledFirst: MentionOption[] = [
      { value: 'alice', label: 'Alice', disabled: true },
      { value: 'bob', label: 'Bob' },
      { value: 'carol', label: 'Carol' },
    ];
    render(<Mentions options={disabledFirst} aria-label="评论" />);
    const ta = screen.getByRole('combobox') as HTMLTextAreaElement;
    typeInto(ta, '@');
    const [aliceOpt, bobOpt] = screen.getAllByRole('option');
    // 禁用的 Alice 不应被高亮;首个可选项 Bob 才是初始高亮。
    expect(aliceOpt).toHaveAttribute('aria-disabled', 'true');
    expect(aliceOpt).toHaveAttribute('aria-selected', 'false');
    expect(bobOpt).toHaveAttribute('aria-selected', 'true');
    // aria-activedescendant 指向 Bob(index 1),而非禁用的 index 0。
    expect(ta.getAttribute('aria-activedescendant')).toBe(bobOpt?.id);
  });

  it('首项 disabled 时按 Enter 既不回填也不漏换行(preventDefault)', () => {
    const disabledFirst: MentionOption[] = [
      { value: 'alice', label: 'Alice', disabled: true },
      { value: 'bob', label: 'Bob' },
    ];
    const onChange = vi.fn();
    render(<Mentions options={disabledFirst} onChange={onChange} aria-label="评论" />);
    const ta = screen.getByRole('combobox') as HTMLTextAreaElement;
    typeInto(ta, '@');
    onChange.mockClear();
    // 直接 Enter:高亮在 Bob(已跳过禁用 Alice)→ 选中 Bob,不插换行。
    const enter = fireEvent.keyDown(ta, { key: 'Enter' });
    // preventDefault 已调用(返回 false 表示事件被取消)→ 不会漏到 textarea 插换行。
    expect(enter).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith('@Bob ');
  });

  it('全部候选 disabled 时 Enter 仍 preventDefault,不漏换行且不回填', () => {
    const allDisabled: MentionOption[] = [
      { value: 'alice', label: 'Alice', disabled: true },
      { value: 'bob', label: 'Bob', disabled: true },
    ];
    const onChange = vi.fn();
    render(<Mentions options={allDisabled} onChange={onChange} aria-label="评论" />);
    const ta = screen.getByRole('combobox') as HTMLTextAreaElement;
    typeInto(ta, '@');
    onChange.mockClear();
    const enter = fireEvent.keyDown(ta, { key: 'Enter' });
    // 浮层开着但无可选项:Enter 仍被取消,避免漏换行。
    expect(enter).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ArrowDown 跳过中间的 disabled 候选', () => {
    const midDisabled: MentionOption[] = [
      { value: 'alice', label: 'Alice' },
      { value: 'bob', label: 'Bob', disabled: true },
      { value: 'carol', label: 'Carol' },
    ];
    const onChange = vi.fn();
    render(<Mentions options={midDisabled} onChange={onChange} aria-label="评论" />);
    const ta = screen.getByRole('combobox') as HTMLTextAreaElement;
    typeInto(ta, '@');
    // 初始高亮 Alice(index 0,可选);下移应跳过禁用的 Bob 直接到 Carol。
    fireEvent.keyDown(ta, { key: 'ArrowDown' });
    fireEvent.keyDown(ta, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith('@Carol ');
  });

  it('透传原生属性(placeholder)到 textarea,forwardRef 指向 textarea', () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<Mentions options={OPTIONS} placeholder="写点什么" ref={ref} aria-label="评论" />);
    const ta = screen.getByRole('combobox') as HTMLTextAreaElement;
    expect(ta).toHaveAttribute('placeholder', '写点什么');
    expect(ref.current).toBe(ta);
  });
});
