// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TimePicker } from './TimePicker';

describe('TimePicker', () => {
  it('渲染为 combobox(role),只读输入框,带基础类名与占位', () => {
    render(<TimePicker aria-label="时间" />);
    const trigger = screen.getByRole('combobox', { name: '时间' });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('readonly');
    expect(trigger).toHaveClass('ms-time-picker__input');
    expect(trigger).toHaveAttribute('placeholder', '请选择时间');
  });

  it('受控 value(字符串)格式化显示在 trigger', () => {
    render(<TimePicker aria-label="时间" value="09:30:15" />);
    expect(screen.getByRole('combobox', { name: '时间' })).toHaveValue('09:30:15');
  });

  it('受控 value(Date)按本地时分秒显示', () => {
    render(<TimePicker aria-label="时间" value={new Date(2020, 0, 1, 8, 5, 6)} />);
    expect(screen.getByRole('combobox', { name: '时间' })).toHaveValue('08:05:06');
  });

  it('showSecond=false 时只显示 HH:mm', () => {
    render(<TimePicker aria-label="时间" value="09:30:15" showSecond={false} />);
    expect(screen.getByRole('combobox', { name: '时间' })).toHaveValue('09:30');
  });

  it('use12Hours 显示带 AM/PM,并渲染 4 列 listbox', () => {
    render(<TimePicker aria-label="时间" value="13:05:00" use12Hours />);
    expect(screen.getByRole('combobox', { name: '时间' })).toHaveValue('01:05:00 PM');
    // 时/分/秒/子午线 = 4 列
    expect(screen.getAllByRole('listbox', { hidden: true })).toHaveLength(4);
  });

  it('点选某列的值触发 onChange,返回格式化字符串与 parts', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="时间" value="00:00:00" onChange={onChange} />);
    // 分钟列里点 "30"(默认 step 1,值唯一)
    const opt30 = screen.getAllByRole('option', { name: '30', hidden: true })[0];
    expect(opt30).toBeDefined();
    if (opt30) {
      fireEvent.click(opt30);
    }
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toBe('00:30:00');
    expect(onChange.mock.calls[0]?.[1]).toEqual({ h: 0, m: 30, s: 0 });
  });

  it('选中项标记 aria-selected 且有选中类名', () => {
    render(<TimePicker aria-label="时间" value="09:00:00" />);
    const nine = screen.getAllByRole('option', { name: '09', hidden: true })[0];
    expect(nine).toHaveAttribute('aria-selected', 'true');
    expect(nine).toHaveClass('ms-time-picker__option--selected');
  });

  it('disabledHours 把对应小时项标禁用且点了不触发 onChange', () => {
    const onChange = vi.fn();
    render(
      <TimePicker aria-label="时间" value="00:00:00" disabledHours={[3]} onChange={onChange} />,
    );
    const three = screen.getAllByRole('option', { name: '03', hidden: true })[0];
    expect(three).toHaveAttribute('aria-disabled', 'true');
    if (three) {
      fireEvent.click(three);
    }
    expect(onChange).not.toHaveBeenCalled();
  });

  it('minuteStep 生成稀疏分钟列(0/15/30/45)', () => {
    render(<TimePicker aria-label="时间" value="00:00:00" minuteStep={15} showSecond={false} />);
    const cols = screen.getAllByRole('listbox', { hidden: true });
    const minuteCol = cols[1]; // [时, 分]
    expect(minuteCol).toBeDefined();
    const minuteOpts = minuteCol
      ? Array.from(minuteCol.querySelectorAll('[role="option"]')).map((el) => el.textContent)
      : [];
    expect(minuteOpts).toEqual(['00', '15', '30', '45']);
  });

  it('clearable 有值时显示清除钮,点击清空并回调 null', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="时间" value="09:30:00" clearable onChange={onChange} />);
    const clear = screen.getByRole('button', { name: '清除' });
    fireEvent.click(clear);
    expect(onChange).toHaveBeenCalledWith(null, null);
  });

  it('底部「此刻 / 确定」按钮存在,点「此刻」回调一个时间', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="时间" onChange={onChange} />);
    expect(screen.getByRole('button', { name: '确定', hidden: true })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '此刻', hidden: true }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[1]).not.toBeNull();
  });

  it('footer=false 时不渲染操作栏', () => {
    render(<TimePicker aria-label="时间" footer={false} />);
    expect(screen.queryByRole('button', { name: '此刻', hidden: true })).toBeNull();
  });

  it('受控开合:open 控制 aria-expanded,点击触发 onOpenChange', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <TimePicker aria-label="时间" open={false} onOpenChange={onOpenChange} />,
    );
    const trigger = screen.getByRole('combobox', { name: '时间' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    rerender(<TimePicker aria-label="时间" open onOpenChange={onOpenChange} />);
    expect(screen.getByRole('combobox', { name: '时间' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('键盘 ↓ 在小时列选下一个可用值', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="时间" value="00:00:00" onChange={onChange} />);
    const hourCol = screen.getAllByRole('listbox', { hidden: true })[0];
    expect(hourCol).toBeDefined();
    if (hourCol) {
      fireEvent.keyDown(hourCol, { key: 'ArrowDown' });
    }
    // 从 00 → 下一个可用 01
    expect(onChange.mock.calls[0]?.[1]).toEqual({ h: 1, m: 0, s: 0 });
  });

  it('invalid 设 aria-invalid 并加 danger tone 类名', () => {
    render(<TimePicker aria-label="时间" invalid />);
    const trigger = screen.getByRole('combobox', { name: '时间' });
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger.closest('.ms-time-picker')).toHaveClass('ms-tone-danger');
  });

  it('disabled 时 input 禁用,点击不展开', () => {
    const onOpenChange = vi.fn();
    render(<TimePicker aria-label="时间" disabled onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole('combobox', { name: '时间' });
    expect(trigger).toBeDisabled();
    fireEvent.click(trigger);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('forwardRef 指向 trigger input;custom format 覆盖默认显示', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <TimePicker ref={ref} aria-label="时间" value="09:05:00" format={(p) => `${p.h}h${p.m}m`} />,
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(screen.getByRole('combobox', { name: '时间' })).toHaveValue('9h5m');
  });

  // —— 回归:无初值时单列选值,未改动的列(时/秒)必须落在选项内、不越过 step / 禁用 ——
  it('hourStep=2 无初值点「分」,提交的小时落在小时列选项内(基线对齐而非裸 now)', () => {
    vi.useFakeTimers();
    // now 的小时是奇数 9——不在 hourStep=2 的 [0,2,4,..] 列里,旧逻辑会把它直接提交出去。
    vi.setSystemTime(new Date(2020, 0, 1, 9, 41, 7));
    const onChange = vi.fn();
    render(<TimePicker aria-label="时间" hourStep={2} onChange={onChange} />);
    // 分钟列默认 step 1,点 "30"
    const opt30 = screen.getAllByRole('option', { name: '30', hidden: true })[0];
    expect(opt30).toBeDefined();
    if (opt30) {
      fireEvent.click(opt30);
    }
    expect(onChange).toHaveBeenCalledTimes(1);
    const parts = onChange.mock.calls[0]?.[1] as { h: number; m: number; s: number };
    // hourStep=2 → 合法小时为偶数;9 应被对齐到选项内的偶数(就近 8 或 10),绝不是奇数 9。
    const hourOptions = Array.from({ length: 12 }, (_, i) => i * 2); // 0,2,..,22
    expect(hourOptions).toContain(parts.h);
    expect(parts.m).toBe(30);
    vi.useRealTimers();
  });

  it('use12Hours + hourStep=2 点「此刻」,小时列有高亮项(显示列与 clamp 网格同源)', () => {
    vi.useFakeTimers();
    // now 小时 9 → 12 制 hour12=9(奇数,落在 [1,3,5,7,9,11] 列里)。
    // 旧逻辑 clamp 用 24h step 网格 [0,2,..] 算出偶数小时,其 hour12 不在显示列,高亮丢失。
    vi.setSystemTime(new Date(2020, 0, 1, 9, 0, 0));
    render(<TimePicker aria-label="时间" use12Hours hourStep={2} />);
    fireEvent.click(screen.getByRole('button', { name: '此刻', hidden: true }));
    const hourCol = screen.getAllByRole('listbox', { hidden: true })[0];
    expect(hourCol).toBeDefined();
    const selected = hourCol?.querySelector('[role="option"][aria-selected="true"]');
    expect(selected).not.toBeNull();
    vi.useRealTimers();
  });

  // —— 回归:用户 style 不得覆盖 CSS Anchor Positioning 的 anchor-name / position-anchor ——
  // 结构上 anchor-name 在根 span、position-anchor 在浮层 div,二者都不接收 {...rest},
  // 用户 style 经 rest 落到内层 input,无法触及锚点元素 —— 本就安全。本测试锁定该不变量,
  // 防后续重构把 {...rest} 误展开到锚点元素上而悄悄退化(弹层掉到 top-layer 左上角)。
  it('用户传 style 时,根的 anchor-name 与浮层的 position-anchor 都不被覆盖', () => {
    render(<TimePicker aria-label="时间" style={{ maxInlineSize: '16rem' }} />);
    const trigger = screen.getByRole('combobox', { name: '时间' });

    // 1) 用户 style 经 {...rest} 落到 trigger input,确实生效。
    expect(trigger).toHaveStyle({ maxInlineSize: '16rem' });

    // 2) 根 span(承载 anchor-name)未被用户 style 触及,anchor-name 完好。
    const root = trigger.closest('.ms-time-picker') as HTMLElement;
    expect(root).not.toBeNull();
    const anchorName = root.style.getPropertyValue('anchor-name');
    expect(anchorName).toMatch(/^--ms-time-/);
    // 根 span 不应收到用户 style(rest 落在 input 上),anchor-name 不被挤掉。
    expect(root.style.getPropertyValue('max-inline-size')).toBe('');

    // 3) 浮层 panel(承载 position-anchor)同样完好,且与根的 anchor-name 同名。
    const panel = root.querySelector('.ms-time-picker__panel') as HTMLElement;
    expect(panel).not.toBeNull();
    expect(panel.style.getPropertyValue('position-anchor')).toBe(anchorName);
  });

  // 用户 style 与 anchor-name 落在不同元素上,断言它们不会互相覆盖(同元素被覆盖才是 Select 那类 bug)。
  it('用户 style 与 anchor-name 处于不同元素,inline style 各自完整', () => {
    render(<TimePicker aria-label="时间" style={{ maxInlineSize: '12rem' }} />);
    const trigger = screen.getByRole('combobox', { name: '时间' });
    const root = trigger.closest('.ms-time-picker') as HTMLElement;
    // trigger 的 inline style 含用户样式;根 span 的 inline style 含 anchor-name。
    expect(trigger.getAttribute('style') ?? '').toContain('max-inline-size: 12rem');
    expect(root.getAttribute('style') ?? '').toContain('anchor-name:');
  });

  it('size 与 classNames 槽位生效', () => {
    render(
      <TimePicker
        aria-label="时间"
        size="lg"
        classNames={{ trigger: 'x-trigger', panel: 'x-panel' }}
      />,
    );
    const trigger = screen.getByRole('combobox', { name: '时间' });
    expect(trigger).toHaveClass('x-trigger');
    expect(trigger.closest('.ms-time-picker')).toHaveClass('ms-time-picker--lg');
  });
});
