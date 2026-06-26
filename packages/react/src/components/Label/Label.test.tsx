// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Label } from './Label';
import { resolveLabelClasses, resolveMark } from './logic';

describe('Label', () => {
  it('size 落在根 label,默认 md', () => {
    const { rerender } = render(<Label>姓名</Label>);
    expect(screen.getByText('姓名')).toHaveClass('ms-label', 'ms-label--md', 'ms-tone-neutral');
    rerender(<Label size="lg">姓名</Label>);
    expect(screen.getByText('姓名')).toHaveClass('ms-label--lg');
  });

  it('tone 映射到根 ms-tone-*(默认 neutral)', () => {
    const { rerender } = render(<Label>字段</Label>);
    expect(screen.getByText('字段')).toHaveClass('ms-tone-neutral');
    rerender(<Label tone="success">字段</Label>);
    expect(screen.getByText('字段')).toHaveClass('ms-tone-success');
  });

  it('required:渲染装饰星号 + 读屏必填语义,加 required 类', () => {
    render(<Label required>邮箱</Label>);
    const label = screen.getByText('邮箱');
    expect(label).toHaveClass('ms-label--required');
    // 装饰星号 aria-hidden
    const mark = label.querySelector('.ms-label__required');
    expect(mark).toHaveTextContent('*');
    expect(mark).toHaveAttribute('aria-hidden', 'true');
    // 读屏可读的「必填」语义
    expect(label.querySelector('.ms-label__sr')).toHaveTextContent('必填');
  });

  it('optional:渲染「可选」文案(走 i18n),与 required 互斥(required 优先)', () => {
    const { rerender } = render(<Label optional>昵称</Label>);
    expect(screen.getByText('可选')).toBeInTheDocument();
    expect(screen.getByText('昵称')).toHaveClass('ms-label--optional');
    // 同传 required 与 optional:只认 required
    rerender(
      <Label required optional>
        昵称
      </Label>,
    );
    const label = screen.getByText('昵称');
    expect(label).toHaveClass('ms-label--required');
    expect(label).not.toHaveClass('ms-label--optional');
    expect(screen.queryByText('可选')).toBeNull();
  });

  it('requiredMark / requiredClassName:替换默认 * 并加自定义类', () => {
    render(
      <Label required requiredMark={<span data-testid="rm">必</span>} requiredClassName="my-mark">
        手机号
      </Label>,
    );
    expect(screen.getByTestId('rm')).toBeInTheDocument();
    expect(screen.getByText('手机号').querySelector('.ms-label__required')).toHaveClass('my-mark');
  });

  it('disabled:加禁用类、aria-disabled,且拦截点击', () => {
    const onClick = vi.fn();
    render(
      <Label disabled onClick={onClick}>
        禁用字段
      </Label>,
    );
    const label = screen.getByText('禁用字段');
    expect(label).toHaveClass('ms-label--disabled');
    expect(label).toHaveAttribute('aria-disabled', 'true');
    // 用户处理器仍被调用(compose),但内部会 preventDefault
    const event = fireEvent.click(label);
    expect(onClick).toHaveBeenCalledOnce();
    expect(event).toBe(false); // preventDefault 生效,fireEvent 返回 false
  });

  it('events:onClick 透传到根,用户处理器与内部不互相覆盖(启用态)', () => {
    const onClick = vi.fn();
    render(<Label onClick={onClick}>可点</Label>);
    fireEvent.click(screen.getByText('可点'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('留口:...rest 透传原生属性(htmlFor / data-* / id)到根 label', () => {
    render(
      <Label htmlFor="email" id="lbl" data-testid="lab" className="extra">
        邮箱
      </Label>,
    );
    const label = screen.getByTestId('lab');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'email');
    expect(label).toHaveAttribute('id', 'lbl');
    expect(label).toHaveClass('extra');
  });

  it('logic:resolveMark 互斥决议,resolveLabelClasses 拼装', () => {
    expect(resolveMark(true, true)).toBe('required');
    expect(resolveMark(false, true)).toBe('optional');
    expect(resolveMark(false, false)).toBe('none');
    expect(
      resolveLabelClasses({ size: 'sm', tone: 'danger', mark: 'required', disabled: true }),
    ).toBe('ms-label ms-label--sm ms-tone-danger ms-label--required ms-label--disabled');
  });
});
