// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar, AvatarGroup } from './Avatar';
import { getInitials, toneFromName } from './logic';

describe('Avatar', () => {
  it('有 src 渲染 img(语义由 img alt 承载),占位首字母不出现', () => {
    const { container } = render(<Avatar src="https://x/a.png" name="Ada Lovelace" />);
    // 图片态:唯一的 img role 是内层 <img>,alt 取自 name
    const img = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(img).toHaveClass('ms-avatar__img');
    expect(container.querySelector('.ms-avatar__initials')).toBeNull();
  });

  it('无 src 取首字母占位(首尾词首字母,大写,最多 2 字)', () => {
    render(<Avatar name="Ada Lovelace" />);
    const el = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(el).toHaveClass('ms-avatar--fallback');
    expect(el.querySelector('.ms-avatar__initials')).toHaveTextContent('AL');
  });

  it('tone 映射到 ms-tone-* 类;显式 tone 优先于 name 哈希', () => {
    const { rerender } = render(<Avatar name="x" tone="danger" />);
    expect(screen.getByRole('img')).toHaveClass('ms-tone-danger');
    rerender(<Avatar name="x" colorful={false} />);
    expect(screen.getByRole('img')).toHaveClass('ms-tone-primary');
  });

  it('colorful:同名确定性同色,不同名可不同(哈希稳定)', () => {
    expect(toneFromName('Ada Lovelace')).toBe(toneFromName('Ada Lovelace'));
    const { rerender } = render(<Avatar name="Ada Lovelace" />);
    const tone1 = [...screen.getByRole('img').classList].find((c) => c.startsWith('ms-tone-'));
    rerender(<Avatar name="Ada Lovelace" />);
    const tone2 = [...screen.getByRole('img').classList].find((c) => c.startsWith('ms-tone-'));
    expect(tone1).toBe(tone2);
  });

  it('img 加载失败 onError 回退首字母占位,并 compose imgProps.onError', () => {
    let called = false;
    const { container } = render(
      <Avatar
        src="https://x/broken.png"
        name="Grace Hopper"
        imgProps={{
          onError: () => {
            called = true;
          },
        }}
      />,
    );
    // 图片态:img role 命中内层 <img>
    const img = screen.getByRole('img', { name: 'Grace Hopper' });
    expect(img).toHaveClass('ms-avatar__img');
    fireEvent.error(img);
    expect(called).toBe(true);
    // 回退后:根 span 变占位态(role=img + aria-label),首字母出现
    const fallbackEl = screen.getByRole('img', { name: 'Grace Hopper' });
    expect(fallbackEl).toHaveClass('ms-avatar', 'ms-avatar--fallback');
    expect(container.querySelector('.ms-avatar__initials')).toHaveTextContent('GH');
  });

  it('status:渲染状态点,带状态 tone 与 status role/label', () => {
    render(<Avatar name="x" status="busy" statusPulse />);
    const dot = screen.getByRole('status', { name: '忙碌' });
    expect(dot).toHaveClass('ms-avatar__status', 'ms-avatar__status--busy', 'ms-tone-danger');
    expect(dot).toHaveClass('ms-avatar__status--pulse');
  });

  it('shape / ring / bordered / glow 加对应类', () => {
    render(<Avatar name="x" shape="rounded" ring bordered glow="always" />);
    const el = screen.getByRole('img');
    expect(el).toHaveClass(
      'ms-avatar--rounded',
      'ms-avatar--ring',
      'ms-avatar--bordered',
      'ms-avatar--glow-always',
    );
  });

  it('size 传 number 时走 custom 类并注入 CSS 变量', () => {
    render(<Avatar name="x" size={120} />);
    const el = screen.getByRole('img');
    expect(el).toHaveClass('ms-avatar--custom');
    expect(el.style.getPropertyValue('--ms-avatar-size')).toBe('120px');
  });

  it('fallback 槽位覆盖首字母', () => {
    render(<Avatar name="x" fallback={<span data-testid="ic">★</span>} />);
    expect(screen.getByTestId('ic')).toBeInTheDocument();
    expect(screen.getByRole('img').querySelector('.ms-avatar__initials')).toBeNull();
  });

  it('asChild:渲染为 <a> 并合并头像样式与 href', () => {
    render(
      <Avatar asChild name="x" tone="accent">
        <a href="/u/1" aria-label="去主页">
          <span className="ms-avatar__initials">X</span>
        </a>
      </Avatar>,
    );
    const link = screen.getByRole('link', { name: '去主页' });
    expect(link).toHaveClass('ms-avatar', 'ms-tone-accent');
    expect(link).toHaveAttribute('href', '/u/1');
  });

  it('imgProps 透传(loading/decoding)', () => {
    render(
      <Avatar src="https://x/a.png" name="x" imgProps={{ loading: 'lazy', decoding: 'async' }} />,
    );
    const img = screen.getByRole('img', { name: 'x' });
    expect(img).toHaveClass('ms-avatar__img');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });
});

describe('AvatarGroup', () => {
  it('role=group + spacing 类,渲染全部子项', () => {
    render(
      <AvatarGroup spacing="tight">
        <Avatar name="A B" />
        <Avatar name="C D" />
      </AvatarGroup>,
    );
    const group = screen.getByRole('group');
    expect(group).toHaveClass('ms-avatar-group', 'ms-avatar-group--tight');
    expect(within(group).getAllByRole('img')).toHaveLength(2);
  });

  it('max 限制 + 余量 “+N” 占位', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar name="A A" />
        <Avatar name="B B" />
        <Avatar name="C C" />
        <Avatar name="D D" />
      </AvatarGroup>,
    );
    const group = screen.getByRole('group');
    // 2 个可见头像 + 1 个 “+2” 占位 = 3 个 img 角色
    expect(within(group).getAllByRole('img')).toHaveLength(3);
    expect(within(group).getByRole('img', { name: '+2' })).toBeInTheDocument();
  });

  it('size 统一下发给子 Avatar', () => {
    render(
      <AvatarGroup size={48}>
        <Avatar name="A A" />
      </AvatarGroup>,
    );
    const img = screen.getByRole('img', { name: 'A A' });
    expect(img.style.getPropertyValue('--ms-avatar-size')).toBe('48px');
  });
});

describe('Avatar logic', () => {
  it('getInitials:空串/单词/多词', () => {
    expect(getInitials('')).toBe('');
    expect(getInitials('madonna')).toBe('M');
    expect(getInitials('Ada Lovelace King')).toBe('AK');
  });

  it('toneFromName:确定性 + 落在合法 tone 池内', () => {
    const pool = ['primary', 'accent', 'success', 'warning', 'info'];
    expect(pool).toContain(toneFromName('whoever'));
    expect(toneFromName('whoever')).toBe(toneFromName('whoever'));
  });
});
