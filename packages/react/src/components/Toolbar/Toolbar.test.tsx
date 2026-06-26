// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Toolbar } from './Toolbar';

describe('Toolbar', () => {
  it('渲染 role=toolbar 并带 aria-orientation 与基础类名', () => {
    render(
      <Toolbar aria-label="格式">
        <Toolbar.Button>加粗</Toolbar.Button>
      </Toolbar>,
    );
    const bar = screen.getByRole('toolbar', { name: '格式' });
    expect(bar).toHaveAttribute('aria-orientation', 'horizontal');
    expect(bar).toHaveClass('ms-toolbar', 'ms-toolbar--horizontal');
  });

  it('roving tabindex:仅首个可聚焦项进 Tab 序(0),其余 -1', () => {
    render(
      <Toolbar aria-label="t">
        <Toolbar.Button>一</Toolbar.Button>
        <Toolbar.Button>二</Toolbar.Button>
        <Toolbar.Button>三</Toolbar.Button>
      </Toolbar>,
    );
    expect(screen.getByText('一').closest('button')).toHaveAttribute('tabindex', '0');
    expect(screen.getByText('二').closest('button')).toHaveAttribute('tabindex', '-1');
    expect(screen.getByText('三').closest('button')).toHaveAttribute('tabindex', '-1');
  });

  it('横向:→ 把焦点移到下一项,← 移回上一项,环形回绕', () => {
    render(
      <Toolbar aria-label="t">
        <Toolbar.Button>一</Toolbar.Button>
        <Toolbar.Button>二</Toolbar.Button>
        <Toolbar.Button>三</Toolbar.Button>
      </Toolbar>,
    );
    const b1 = screen.getByText('一').closest('button') as HTMLButtonElement;
    const b2 = screen.getByText('二').closest('button') as HTMLButtonElement;
    const b3 = screen.getByText('三').closest('button') as HTMLButtonElement;
    b1.focus();
    fireEvent.keyDown(b1, { key: 'ArrowRight' });
    expect(b2).toHaveFocus();
    fireEvent.keyDown(b2, { key: 'ArrowLeft' });
    expect(b1).toHaveFocus();
    // 从首项向左环形回绕到末项
    fireEvent.keyDown(b1, { key: 'ArrowLeft' });
    expect(b3).toHaveFocus();
  });

  it('横向工具栏忽略 ↑/↓(不接管,交回默认)', () => {
    render(
      <Toolbar aria-label="t">
        <Toolbar.Button>一</Toolbar.Button>
        <Toolbar.Button>二</Toolbar.Button>
      </Toolbar>,
    );
    const b1 = screen.getByText('一').closest('button') as HTMLButtonElement;
    b1.focus();
    fireEvent.keyDown(b1, { key: 'ArrowDown' });
    expect(b1).toHaveFocus();
  });

  it('纵向:↑/↓ 移焦,Home/End 跳首尾', () => {
    render(
      <Toolbar aria-label="t" orientation="vertical">
        <Toolbar.Button>一</Toolbar.Button>
        <Toolbar.Button>二</Toolbar.Button>
        <Toolbar.Button>三</Toolbar.Button>
      </Toolbar>,
    );
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-orientation', 'vertical');
    const b1 = screen.getByText('一').closest('button') as HTMLButtonElement;
    const b3 = screen.getByText('三').closest('button') as HTMLButtonElement;
    b1.focus();
    fireEvent.keyDown(b1, { key: 'ArrowDown' });
    expect(screen.getByText('二').closest('button')).toHaveFocus();
    fireEvent.keyDown(screen.getByText('二').closest('button') as HTMLButtonElement, {
      key: 'End',
    });
    expect(b3).toHaveFocus();
    fireEvent.keyDown(b3, { key: 'Home' });
    expect(b1).toHaveFocus();
  });

  it('方向键跳过 disabled 项', () => {
    render(
      <Toolbar aria-label="t">
        <Toolbar.Button>一</Toolbar.Button>
        <Toolbar.Button disabled>二</Toolbar.Button>
        <Toolbar.Button>三</Toolbar.Button>
      </Toolbar>,
    );
    const b1 = screen.getByText('一').closest('button') as HTMLButtonElement;
    b1.focus();
    fireEvent.keyDown(b1, { key: 'ArrowRight' });
    // disabled 的「二」被排除在可聚焦项查询外,直接落到「三」
    expect(screen.getByText('三').closest('button')).toHaveFocus();
  });

  it('Separator 渲染 role=separator,工具栏横向时为竖向分隔', () => {
    render(
      <Toolbar aria-label="t">
        <Toolbar.Button>一</Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.Button>二</Toolbar.Button>
      </Toolbar>,
    );
    const sep = screen.getByRole('separator');
    expect(sep).toHaveAttribute('aria-orientation', 'vertical');
    expect(sep).toHaveClass('ms-toolbar__separator');
  });

  it('Group 渲染 role=group + aria-label', () => {
    render(
      <Toolbar aria-label="t">
        <Toolbar.Group label="对齐">
          <Toolbar.Button>左</Toolbar.Button>
          <Toolbar.Button>右</Toolbar.Button>
        </Toolbar.Group>
      </Toolbar>,
    );
    expect(screen.getByRole('group', { name: '对齐' })).toBeInTheDocument();
  });

  it('ToggleGroup single:radiogroup 语义,非受控点击切换 aria-checked', () => {
    render(
      <Toolbar aria-label="t">
        <Toolbar.ToggleGroup type="single" label="对齐" defaultValue="left">
          <Toolbar.ToggleItem value="left">左</Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="center">中</Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
      </Toolbar>,
    );
    expect(screen.getByRole('radiogroup', { name: '对齐' })).toBeInTheDocument();
    const left = screen.getByRole('radio', { name: '左' });
    const center = screen.getByRole('radio', { name: '中' });
    expect(left).toHaveAttribute('aria-checked', 'true');
    expect(center).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(center);
    expect(center).toHaveAttribute('aria-checked', 'true');
    expect(left).toHaveAttribute('aria-checked', 'false');
  });

  it('ToggleGroup single 受控:onValueChange 收 string,不自行改值', () => {
    const onValueChange = vi.fn();
    render(
      <Toolbar aria-label="t">
        <Toolbar.ToggleGroup type="single" value="left" onValueChange={onValueChange}>
          <Toolbar.ToggleItem value="left">左</Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="center">中</Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
      </Toolbar>,
    );
    fireEvent.click(screen.getByRole('radio', { name: '中' }));
    expect(onValueChange).toHaveBeenCalledWith('center');
    // 受控未更新 prop → 选中态不变
    expect(screen.getByRole('radio', { name: '左' })).toHaveAttribute('aria-checked', 'true');
  });

  it('ToggleGroup multiple:aria-pressed,可多选,onValueChange 收数组', () => {
    const onValueChange = vi.fn();
    render(
      <Toolbar aria-label="t">
        <Toolbar.ToggleGroup type="multiple" label="样式" onValueChange={onValueChange}>
          <Toolbar.ToggleItem value="bold">粗</Toolbar.ToggleItem>
          <Toolbar.ToggleItem value="italic">斜</Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
      </Toolbar>,
    );
    // multiple → group 语义(非 radiogroup)
    expect(screen.getByRole('group', { name: '样式' })).toBeInTheDocument();
    const bold = screen.getByRole('button', { name: '粗', pressed: false });
    fireEvent.click(bold);
    expect(onValueChange).toHaveBeenLastCalledWith(['bold']);
    fireEvent.click(screen.getByText('斜').closest('button') as HTMLButtonElement);
    expect(onValueChange).toHaveBeenLastCalledWith(['bold', 'italic']);
    // 再点 bold 取消
    fireEvent.click(screen.getByText('粗').closest('button') as HTMLButtonElement);
    expect(onValueChange).toHaveBeenLastCalledWith(['italic']);
  });

  it('用户 onClick 与内部切换经 compose 合并(preventDefault 阻断切换)', () => {
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
    const onValueChange = vi.fn();
    render(
      <Toolbar aria-label="t">
        <Toolbar.ToggleGroup type="multiple" onValueChange={onValueChange}>
          <Toolbar.ToggleItem value="bold" onClick={onClick}>
            粗
          </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
      </Toolbar>,
    );
    fireEvent.click(screen.getByText('粗').closest('button') as HTMLButtonElement);
    expect(onClick).toHaveBeenCalledTimes(1);
    // 用户 preventDefault → 内部切换不执行
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('Link 渲染 <a> 并进 roving 焦点序', () => {
    render(
      <Toolbar aria-label="t">
        <Toolbar.Link href="#help">帮助</Toolbar.Link>
        <Toolbar.Button>动作</Toolbar.Button>
      </Toolbar>,
    );
    const link = screen.getByRole('link', { name: '帮助' });
    expect(link).toHaveAttribute('href', '#help');
    // 首项(link)进 Tab 序
    expect(link).toHaveAttribute('tabindex', '0');
  });

  it('Button asChild 渲染为子元素 <a> 并保留工具栏样式 / 进焦点序', () => {
    render(
      <Toolbar aria-label="t">
        {/* biome-ignore lint/a11y/useValidAnchor: 测试用 href */}
        <Toolbar.Button asChild>
          <a href="#go">跳转</a>
        </Toolbar.Button>
      </Toolbar>,
    );
    const link = screen.getByRole('link', { name: '跳转' });
    expect(link).toHaveClass('ms-toolbar__button');
    expect(link).toHaveAttribute('tabindex', '0');
  });

  it('wrap 时根带 wrap 类(换行而非滚动)', () => {
    render(
      <Toolbar aria-label="t" wrap>
        <Toolbar.Button>一</Toolbar.Button>
      </Toolbar>,
    );
    expect(screen.getByRole('toolbar')).toHaveClass('ms-toolbar--wrap');
  });

  it('回归:聚焦首项后将其卸载,剩余项仍至少一个进 Tab 序(不跌出 Tab 序)', async () => {
    function Harness() {
      const [showFirst, setShowFirst] = useState(true);
      return (
        <Toolbar aria-label="t">
          {showFirst && <Toolbar.Button>一</Toolbar.Button>}
          <Toolbar.Button>二</Toolbar.Button>
          <Toolbar.Button onClick={() => setShowFirst(false)}>三</Toolbar.Button>
        </Toolbar>
      );
    }
    render(<Harness />);
    const b1 = screen.getByText('一').closest('button') as HTMLButtonElement;
    // 聚焦首项 → 它成为唯一 roving 落点(focusedNode 指向裸 DOM 节点)
    act(() => b1.focus());
    expect(b1).toHaveAttribute('tabindex', '0');
    // 卸载首项:focusedNode 仍非 null 但指向已卸载节点
    fireEvent.click(screen.getByText('三').closest('button') as HTMLButtonElement);
    expect(screen.queryByText('一')).not.toBeInTheDocument();
    // 关键断言:剩余项里至少有一个 tabIndex=0,Tab 仍能进入工具栏
    await waitFor(() => {
      const remaining = screen
        .getAllByRole('button')
        .filter((el) => el.getAttribute('tabindex') === '0');
      expect(remaining.length).toBeGreaterThanOrEqual(1);
    });
    // 且兜底落点应是新的 DOM 首项「二」
    expect(screen.getByText('二').closest('button')).toHaveAttribute('tabindex', '0');
  });

  it('回归:聚焦某项后把它设为 disabled,仍有可 Tab 进入项(兜底落到下一可用项)', async () => {
    function Harness() {
      const [disabledFirst, setDisabledFirst] = useState(false);
      return (
        <Toolbar aria-label="t">
          <Toolbar.Button disabled={disabledFirst}>一</Toolbar.Button>
          <Toolbar.Button>二</Toolbar.Button>
          <Toolbar.Button onClick={() => setDisabledFirst(true)}>禁用首项</Toolbar.Button>
        </Toolbar>
      );
    }
    render(<Harness />);
    const b1 = screen.getByText('一').closest('button') as HTMLButtonElement;
    act(() => b1.focus());
    expect(b1).toHaveAttribute('tabindex', '0');
    // 把当前落点项设为 disabled → 它被 queryItems 过滤,落点失效
    fireEvent.click(screen.getByText('禁用首项').closest('button') as HTMLButtonElement);
    expect(b1).toBeDisabled();
    // 关键断言:仍有非禁用项进 Tab 序
    await waitFor(() => {
      const tabbable = screen
        .getAllByRole('button')
        .filter((el) => el.getAttribute('tabindex') === '0' && !(el as HTMLButtonElement).disabled);
      expect(tabbable.length).toBeGreaterThanOrEqual(1);
    });
    // 兜底应落到下一可用项「二」
    expect(screen.getByText('二').closest('button')).toHaveAttribute('tabindex', '0');
  });

  it('forwardRef 透到根 toolbar 元素', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Toolbar aria-label="t" ref={ref}>
        <Toolbar.Button>一</Toolbar.Button>
      </Toolbar>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('role', 'toolbar');
  });
});
