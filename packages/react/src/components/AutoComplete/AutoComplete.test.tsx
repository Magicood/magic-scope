// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { AutoComplete, type AutoCompleteOptions } from './AutoComplete';

// jsdom 不实现 Popover API,垫片以让组件可挂载并让显隐同步逻辑可断言。
beforeAll(() => {
  if (!HTMLElement.prototype.showPopover) {
    HTMLElement.prototype.showPopover = vi.fn();
    HTMLElement.prototype.hidePopover = vi.fn();
  }
});

const options = [
  { value: 'apple', label: '苹果 Apple' },
  { value: 'apricot', label: '杏 Apricot' },
  { value: 'banana', label: '香蕉 Banana' },
  { value: 'cherry', label: '樱桃 Cherry', disabled: true },
];

describe('AutoComplete', () => {
  it('渲染 combobox input,带 aria-autocomplete=list 与尺寸/tone 类名', () => {
    render(<AutoComplete options={options} size="lg" tone="success" aria-label="水果" />);

    const input = screen.getByRole('combobox', { name: '水果' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-controls');
    // 尺寸/tone 落在根
    const root = input.closest('.ms-autocomplete');
    expect(root).toHaveClass('ms-autocomplete--lg', 'ms-tone-success');
  });

  it('输入即开下拉并按子串过滤候选(默认大小写不敏感),onChange/onSearch 都回调', () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();
    render(
      <AutoComplete options={options} onChange={onChange} onSearch={onSearch} aria-label="水果" />,
    );

    const input = screen.getByRole('combobox', { name: '水果' });
    fireEvent.change(input, { target: { value: 'ap' } });

    expect(onChange).toHaveBeenLastCalledWith('ap');
    expect(onSearch).toHaveBeenLastCalledWith('ap');
    expect(input).toHaveAttribute('aria-expanded', 'true');

    // 'ap' 命中 apple / apricot,不含 banana
    expect(screen.getByRole('option', { name: '苹果 Apple', hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '杏 Apricot', hidden: true })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: '香蕉 Banana', hidden: true }),
    ).not.toBeInTheDocument();
  });

  it('点选候选项:填入 value、触发 onSelect 并关闭(非受控)', () => {
    const onSelect = vi.fn();
    render(<AutoComplete options={options} onSelect={onSelect} aria-label="水果" />);

    const input = screen.getByRole('combobox', { name: '水果' });
    fireEvent.change(input, { target: { value: 'ban' } });
    const opt = screen.getByRole('option', { name: '香蕉 Banana', hidden: true });
    // 用 pointerDown(组件用 pointerdown 选中以避开 input blur)
    fireEvent.pointerDown(opt);

    expect(onSelect).toHaveBeenCalledWith('banana', expect.objectContaining({ value: 'banana' }));
    // 选中后输入框填入该 value
    expect(input).toHaveValue('banana');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('键盘 ↑↓ 高亮、Enter 选中填入、Esc 关闭', () => {
    const onSelect = vi.fn();
    render(<AutoComplete options={options} onSelect={onSelect} aria-label="水果" />);

    const input = screen.getByRole('combobox', { name: '水果' });
    fireEvent.change(input, { target: { value: 'ap' } });

    // ↓ 高亮首个可用项(apple)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant');
    const firstActive = screen.getByRole('option', { name: '苹果 Apple', hidden: true });
    expect(firstActive).toHaveAttribute('data-active', '');
    expect(firstActive).toHaveAttribute('aria-selected', 'true');

    // ↓ 再下移到 apricot
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: '杏 Apricot', hidden: true })).toHaveAttribute(
      'data-active',
      '',
    );

    // Enter 选中高亮项
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('apricot', expect.objectContaining({ value: 'apricot' }));
    expect(input).toHaveValue('apricot');

    // 重新输入展开,Esc 关闭
    fireEvent.change(input, { target: { value: 'a' } });
    expect(input).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('禁用候选项不可选中:点击/箭头跳过', () => {
    const onSelect = vi.fn();
    render(<AutoComplete options={options} onSelect={onSelect} aria-label="水果" />);

    const input = screen.getByRole('combobox', { name: '水果' });
    fireEvent.change(input, { target: { value: 'cherry' } });
    const disabledOpt = screen.getByRole('option', { name: '樱桃 Cherry', hidden: true });
    expect(disabledOpt).toHaveAttribute('aria-disabled', 'true');

    fireEvent.pointerDown(disabledOpt);
    expect(onSelect).not.toHaveBeenCalled();
    // 仍展开(未选中关闭)
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('filterOption=false 关闭内置过滤:输入不收窄候选(供受控远程搜索)', () => {
    render(<AutoComplete options={options} filterOption={false} open aria-label="水果" />);

    const input = screen.getByRole('combobox', { name: '水果' });
    fireEvent.change(input, { target: { value: 'zzz' } });
    // 关闭内置过滤:全部候选仍在(禁用项也渲染)
    expect(screen.getByRole('option', { name: '苹果 Apple', hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '香蕉 Banana', hidden: true })).toBeInTheDocument();
  });

  it('loading 显示加载文案且 input aria-busy', () => {
    render(<AutoComplete options={options} loading open aria-label="水果" />);
    const input = screen.getByRole('combobox', { name: '水果' });
    expect(input).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('加载中…')).toBeInTheDocument();
  });

  it('无匹配候选显示空态文案', () => {
    render(<AutoComplete options={options} open aria-label="水果" />);
    const input = screen.getByRole('combobox', { name: '水果' });
    fireEvent.change(input, { target: { value: 'zzz-no-match' } });
    expect(screen.getByText('无匹配项')).toBeInTheDocument();
  });

  it('allowClear:有值显清除,点击清空并触发 onClear', () => {
    const onClear = vi.fn();
    const onChange = vi.fn();
    render(
      <AutoComplete
        options={options}
        defaultValue="banana"
        allowClear
        onClear={onClear}
        onChange={onChange}
        aria-label="水果"
      />,
    );

    const input = screen.getByRole('combobox', { name: '水果' });
    expect(input).toHaveValue('banana');
    const clear = screen.getByRole('button', { name: '清除' });
    fireEvent.pointerDown(clear);

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(input).toHaveValue('');
  });

  it('受控 value:外部 state 驱动输入显示', () => {
    function Controlled() {
      const [v, setV] = useState('app');
      return <AutoComplete options={options} value={v} onChange={setV} aria-label="水果" />;
    }
    render(<Controlled />);
    const input = screen.getByRole('combobox', { name: '水果' });
    expect(input).toHaveValue('app');
    fireEvent.change(input, { target: { value: 'apple' } });
    expect(input).toHaveValue('apple');
  });

  it('invalid:input aria-invalid 且根挂 invalid 类与 danger tone', () => {
    render(<AutoComplete options={options} invalid aria-label="水果" />);
    const input = screen.getByRole('combobox', { name: '水果' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const root = input.closest('.ms-autocomplete');
    expect(root).toHaveClass('ms-autocomplete--invalid', 'ms-tone-danger');
  });

  it('分组 options:渲染分组标题且键盘高亮跨组连续', () => {
    const grouped: AutoCompleteOptions = [
      { label: '常见', options: [{ value: 'apple', label: '苹果' }] },
      { label: '其它', options: [{ value: 'banana', label: '香蕉' }] },
    ];
    render(<AutoComplete options={grouped} open aria-label="水果" />);

    expect(screen.getByText('常见')).toBeInTheDocument();
    expect(screen.getByText('其它')).toBeInTheDocument();

    const input = screen.getByRole('combobox', { name: '水果' });
    // 第二个分组的项也能被键盘高亮到(全局索引连续)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: '香蕉', hidden: true })).toHaveAttribute(
      'data-active',
      '',
    );
  });

  it('原生属性透传 + 用户 onKeyDown 与内部导航都触发(composeEventHandlers)', () => {
    const userKeyDown = vi.fn();
    render(
      <AutoComplete
        options={options}
        onKeyDown={userKeyDown}
        placeholder="搜水果"
        data-testid="ac"
        aria-label="水果"
      />,
    );

    const input = screen.getByRole('combobox', { name: '水果' });
    // 原生属性透传到 input
    expect(input).toHaveAttribute('data-testid', 'ac');
    expect(input).toHaveAttribute('placeholder', '搜水果');

    fireEvent.change(input, { target: { value: 'ap' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // 用户处理器触发
    expect(userKeyDown).toHaveBeenCalled();
    // 内部导航也生效
    expect(input).toHaveAttribute('aria-activedescendant');
  });

  it('受控 open=true 下原生 light-dismiss(toggle→closed)被拉回:浮层主动 showPopover 保持一致', () => {
    const onOpenChange = vi.fn();
    // 受控父级坚持 open=true、不在 onOpenChange 里收下关闭。
    render(<AutoComplete options={options} open onOpenChange={onOpenChange} aria-label="水果" />);

    const input = screen.getByRole('combobox', { name: '水果' });
    const listbox = document.getElementById(input.getAttribute('aria-controls') ?? '');
    if (!listbox) throw new Error('listbox not found');

    // 受控 open=true 时未关,React 仍视作展开。
    expect(input).toHaveAttribute('aria-expanded', 'true');

    // 模拟原生 light-dismiss:popover 已隐藏(:popover-open 不再匹配)且派发 toggle→closed。
    const showSpy = vi.spyOn(listbox, 'showPopover');
    const matchesSpy = vi.spyOn(listbox, 'matches').mockReturnValue(false);
    // toggle 事件携带 newState='closed';手工派发带该字段的事件。
    const toggleEvent = new Event('toggle') as Event & { newState?: string };
    toggleEvent.newState = 'closed';
    fireEvent(listbox, toggleEvent);

    // 受控父仍 open=true → 组件主动把浮层拉回,而非误把 React 状态翻成关闭。
    expect(showSpy).toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    // 父级 open 未变,不应被回调成 false(避免错误地通知父级收起)。
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    matchesSpy.mockRestore();
    showSpy.mockRestore();
  });

  it('高亮靠后的候选,候选变短后 aria-activedescendant 不悬空(钳制越界高亮)', () => {
    function Shrinking() {
      const [opts, setOpts] = useState<AutoCompleteOptions>(options);
      return (
        <>
          <button type="button" onClick={() => setOpts([{ value: 'apple', label: '苹果 Apple' }])}>
            收窄
          </button>
          <AutoComplete options={opts} filterOption={false} open aria-label="水果" />
        </>
      );
    }
    render(<Shrinking />);

    const input = screen.getByRole('combobox', { name: '水果' });
    // 高亮到靠后的项(连按 ↓ 走到末尾可用项)。
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const desc = input.getAttribute('aria-activedescendant');
    expect(desc).toBeTruthy();
    // 此刻 activedescendant 必须指向真实存在的 option。
    expect(document.getElementById(desc as string)).toBeInTheDocument();

    // 候选收窄成 1 项,原高亮索引越界。
    fireEvent.click(screen.getByText('收窄'));

    const descAfter = input.getAttribute('aria-activedescendant');
    // 要么复位为空,要么仍指向真实存在的 option —— 绝不悬空。
    if (descAfter) {
      expect(document.getElementById(descAfter)).toBeInTheDocument();
    } else {
      expect(input).not.toHaveAttribute('aria-activedescendant');
    }
  });

  it('forwardRef 暴露真实 input DOM', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<AutoComplete options={options} ref={ref} aria-label="水果" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveAttribute('role', 'combobox');
  });

  // 回归:CSS Anchor Positioning 锚点不被用户 style 覆盖。
  // anchor-name 设在 .ms-autocomplete__control 包裹层、position-anchor 设在浮层,
  // 二者都不吃 {...rest};用户 style 经 {...rest} 落在 <input> 上(另一元素),
  // 故 anchor 永不被用户 style 顶掉 —— 浮层不会丢锚点掉到 top-layer 左上角。
  it('用户传 style 不覆盖 anchor-name / position-anchor(浮层锚点保留)', () => {
    render(<AutoComplete options={options} style={{ maxInlineSize: '16rem' }} aria-label="水果" />);

    const input = screen.getByRole('combobox', { name: '水果' });

    // 用户 style 经 {...rest} 落在 input 上(与锚点元素分离)。
    expect(input.style.getPropertyValue('max-inline-size')).toBe('16rem');
    // input 自身不承载 anchor-name(锚点在外层 control,故用户 style 无从覆盖)。
    expect(input.style.getPropertyValue('anchor-name')).toBe('');

    // 触发器侧:.ms-autocomplete__control 保留 anchor-name,未被用户 style 顶掉。
    const control = input.closest('.ms-autocomplete')?.querySelector('.ms-autocomplete__control');
    expect(control).not.toBeNull();
    const anchorName = (control as HTMLElement).style.getPropertyValue('anchor-name');
    expect(anchorName).toMatch(/^--ms-autocomplete-/);
    // control 不接收用户 style(没拿 rest),不会被 max-inline-size 污染。
    expect((control as HTMLElement).style.getPropertyValue('max-inline-size')).toBe('');

    // 面板侧:popover listbox 保留 position-anchor,且指向同一锚点名。
    const listbox = document.getElementById(input.getAttribute('aria-controls') ?? '');
    expect(listbox).not.toBeNull();
    const positionAnchor = (listbox as HTMLElement).style.getPropertyValue('position-anchor');
    expect(positionAnchor).toBe(anchorName);
    // 面板也不接收用户 style,position-anchor 不会被覆盖。
    expect((listbox as HTMLElement).style.getPropertyValue('max-inline-size')).toBe('');
  });
});
