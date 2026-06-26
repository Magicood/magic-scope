// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Cascader } from './Cascader';
import type { CascaderOption } from './logic';

const tree: CascaderOption[] = [
  {
    value: 'zj',
    label: '浙江',
    children: [
      {
        value: 'hz',
        label: '杭州',
        children: [
          { value: 'xh', label: '西湖' },
          { value: 'yh', label: '余杭', disabled: true },
        ],
      },
      { value: 'nb', label: '宁波', children: [{ value: 'yz', label: '鄞州' }] },
    ],
  },
  {
    value: 'js',
    label: '江苏',
    disabled: true,
    children: [{ value: 'nj', label: '南京' }],
  },
  { value: 'bj', label: '北京' },
];

const getTrigger = () => screen.getByRole('button');

describe('Cascader', () => {
  it('未选中时显示占位,trigger 带基础类名与 aria-expanded(随开合切换)', () => {
    render(<Cascader options={tree} placeholder="请选择地区" />);
    const trigger = getTrigger();
    expect(trigger).toHaveClass('ms-cascader');
    expect(trigger).toHaveAttribute('aria-haspopup');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveTextContent('请选择地区');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('受控 value 渲染完整路径显示串 A / B / C', () => {
    render(<Cascader options={tree} value={['zj', 'hz', 'xh']} />);
    expect(getTrigger()).toHaveTextContent('浙江 / 杭州 / 西湖');
  });

  it('点击 trigger 打开,渲染根列(menu / menuitem)', () => {
    render(<Cascader options={tree} />);
    fireEvent.click(getTrigger());
    expect(screen.getByRole('menuitem', { name: /浙江/, hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /北京/, hidden: true })).toBeInTheDocument();
  });

  it('点击非叶子展开下一列,非叶子带 aria-expanded', () => {
    render(<Cascader options={tree} />);
    fireEvent.click(getTrigger());
    const zj = screen.getByRole('menuitem', { name: /浙江/, hidden: true });
    expect(zj).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(zj);
    expect(zj).toHaveAttribute('aria-expanded', 'true');
    // 第二列出现杭州 / 宁波
    expect(screen.getByRole('menuitem', { name: /杭州/, hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /宁波/, hidden: true })).toBeInTheDocument();
  });

  it('点击叶子提交 value(string[] 路径)与 optionPath,并关闭浮层', () => {
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    render(<Cascader options={tree} onChange={onChange} onOpenChange={onOpenChange} />);
    fireEvent.click(getTrigger());
    fireEvent.click(screen.getByRole('menuitem', { name: /浙江/, hidden: true }));
    fireEvent.click(screen.getByRole('menuitem', { name: /杭州/, hidden: true }));
    fireEvent.click(screen.getByRole('menuitem', { name: '西湖', hidden: true }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toEqual(['zj', 'hz', 'xh']);
    expect((onChange.mock.calls[0]?.[1] as CascaderOption[]).map((o) => o.label)).toEqual([
      '浙江',
      '杭州',
      '西湖',
    ]);
    // 关闭浮层
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    // 非受控:trigger 更新为路径串
    expect(getTrigger()).toHaveTextContent('浙江 / 杭州 / 西湖');
  });

  it('disabled 节点不可选:点击不展开、不触发 onChange', () => {
    const onChange = vi.fn();
    render(<Cascader options={tree} onChange={onChange} />);
    fireEvent.click(getTrigger());
    const js = screen.getByRole('menuitem', { name: /江苏/, hidden: true });
    expect(js).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(js);
    expect(onChange).not.toHaveBeenCalled();
    // 未展开下一列(南京不出现)
    expect(screen.queryByRole('menuitem', { name: '南京', hidden: true })).not.toBeInTheDocument();
  });

  it('changeOnSelect:选非叶子也立即触发 onChange 且不关闭', () => {
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Cascader options={tree} changeOnSelect onChange={onChange} onOpenChange={onOpenChange} />,
    );
    fireEvent.click(getTrigger());
    fireEvent.click(screen.getByRole('menuitem', { name: /浙江/, hidden: true }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toEqual(['zj']);
    // 不应关闭(只展开)
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('受控 value 下点击不改 trigger 文案(交给外部),但仍触发 onChange', () => {
    const onChange = vi.fn();
    render(<Cascader options={tree} value={['bj']} onChange={onChange} />);
    expect(getTrigger()).toHaveTextContent('北京');
    fireEvent.click(getTrigger());
    fireEvent.click(screen.getByRole('menuitem', { name: /浙江/, hidden: true }));
    fireEvent.click(screen.getByRole('menuitem', { name: /杭州/, hidden: true }));
    fireEvent.click(screen.getByRole('menuitem', { name: '西湖', hidden: true }));
    expect(onChange.mock.calls[0]?.[0]).toEqual(['zj', 'hz', 'xh']);
    // 受控:文案不被内部改写,仍为外部 value
    expect(getTrigger()).toHaveTextContent('北京');
  });

  it('键盘:↑↓ 列内移动 + → 进下一列 + Enter 选叶子提交', () => {
    const onChange = vi.fn();
    render(<Cascader options={tree} onChange={onChange} />);
    fireEvent.click(getTrigger());
    const menu = screen.getByRole('menu', { name: /请选择/, hidden: true })
      .parentElement as HTMLElement;
    // 打开时焦点已在浙江(首项);→ 展开浙江 → 第二列首项(杭州)
    fireEvent.keyDown(menu, { key: 'ArrowRight' });
    expect(screen.getByRole('menuitem', { name: /杭州/, hidden: true })).toBeInTheDocument();
    fireEvent.keyDown(menu, { key: 'ArrowRight' }); // 杭州 → 第三列(西湖)
    expect(screen.getByRole('menuitem', { name: '西湖', hidden: true })).toBeInTheDocument();
    // ↓ 会落到余杭(disabled)被跳过,环形回西湖;Enter 选西湖(叶子)
    fireEvent.keyDown(menu, { key: 'Enter' });
    expect(onChange.mock.calls[0]?.[0]).toEqual(['zj', 'hz', 'xh']);
  });

  it('键盘:→ 深入后 ← 回上一列收起当前列', () => {
    render(<Cascader options={tree} />);
    fireEvent.click(getTrigger());
    const menu = screen.getByRole('menu', { name: /请选择/, hidden: true })
      .parentElement as HTMLElement;
    // 焦点在浙江;→ 展开至第二列(杭州),→ 再展开至第三列(西湖)
    fireEvent.keyDown(menu, { key: 'ArrowRight' });
    fireEvent.keyDown(menu, { key: 'ArrowRight' });
    expect(screen.getByRole('menuitem', { name: '西湖', hidden: true })).toBeInTheDocument();
    // ← 收回一列:焦点回到第二列(杭州),第三列(西湖)消失
    fireEvent.keyDown(menu, { key: 'ArrowLeft' });
    expect(screen.queryByRole('menuitem', { name: '西湖', hidden: true })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /杭州/, hidden: true })).toBeInTheDocument();
  });

  it('classNames 槽位透传到 trigger 与 option', () => {
    render(<Cascader options={tree} classNames={{ trigger: 'my-trigger', option: 'my-option' }} />);
    expect(getTrigger()).toHaveClass('my-trigger');
    fireEvent.click(getTrigger());
    expect(screen.getByRole('menuitem', { name: /浙江/, hidden: true })).toHaveClass('my-option');
  });

  it('displayRender 自定义路径展示', () => {
    render(
      <Cascader
        options={tree}
        value={['zj', 'hz', 'xh']}
        displayRender={(labels) => labels.join(' > ')}
      />,
    );
    expect(getTrigger()).toHaveTextContent('浙江 > 杭州 > 西湖');
  });

  it('forwardRef 指向 trigger button', () => {
    const ref = vi.fn();
    render(<Cascader options={tree} ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it('受控 open 模式下点击 trigger 不自行切换,交给 onOpenChange', () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return <Cascader options={tree} open={open} onOpenChange={setOpen} />;
    }
    render(<Controlled />);
    fireEvent.click(getTrigger());
    // onOpenChange 驱动 state → 打开
    expect(screen.getByRole('menuitem', { name: /浙江/, hidden: true })).toBeInTheDocument();
  });

  it('disabled 整体禁用时 trigger 不可点开', () => {
    render(<Cascader options={tree} disabled />);
    const trigger = getTrigger();
    expect(trigger).toBeDisabled();
    fireEvent.click(trigger);
    expect(screen.queryByRole('menuitem', { hidden: true })).not.toBeInTheDocument();
  });

  it('受控 value 在 open 期间外部变更,菜单列随之展开刷新', () => {
    function Controlled() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <>
          <button type="button" onClick={() => setValue(['zj', 'hz'])}>
            外部设值
          </button>
          <Cascader options={tree} value={value} open onOpenChange={() => {}} />
        </>
      );
    }
    render(<Controlled />);
    // 初始 value 为空:只有根列,第二列(杭州)不应出现
    expect(screen.queryByRole('menuitem', { name: /杭州/, hidden: true })).not.toBeInTheDocument();
    // 外部把 value 改成 zj/hz:列应随之展开到第二、第三列
    fireEvent.click(screen.getByRole('button', { name: '外部设值' }));
    expect(screen.getByRole('menuitem', { name: /杭州/, hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '西湖', hidden: true })).toBeInTheDocument();
  });

  it('defaultValue 指向 disabled 项时,初始键盘焦点回退到首个可用项而非 disabled 项', () => {
    // 江苏(js)是 disabled,作为首层选中项;初始 active 不应落在江苏上。
    render(<Cascader options={tree} defaultValue={['js']} />);
    fireEvent.click(getTrigger());
    const js = screen.getByRole('menuitem', { name: /江苏/, hidden: true });
    expect(js).toHaveAttribute('aria-disabled', 'true');
    expect(js).not.toHaveClass('ms-cascader__option--active');
    expect(js).not.toHaveAttribute('data-active');
    // 焦点回退到首个可用项(浙江)
    const zj = screen.getByRole('menuitem', { name: /浙江/, hidden: true });
    expect(zj).toHaveAttribute('data-active', 'true');
  });

  it('选中项与展开项各带状态类名', () => {
    render(<Cascader options={tree} defaultValue={['zj', 'hz', 'xh']} />);
    fireEvent.click(getTrigger());
    const zj = screen.getByRole('menuitem', { name: /浙江/, hidden: true });
    const hz = screen.getByRole('menuitem', { name: /杭州/, hidden: true });
    const xh = screen.getByRole('menuitem', { name: '西湖', hidden: true });
    expect(zj).toHaveClass('ms-cascader__option--expanded');
    expect(hz).toHaveClass('ms-cascader__option--expanded');
    expect(xh).toHaveClass('ms-cascader__option--selected');
    // 内部一致性自检
    expect(within(xh).getByText('西湖')).toBeInTheDocument();
  });
});
