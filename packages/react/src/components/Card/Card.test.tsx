// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Card, CardBody, CardFooter, CardHeader, CardMedia, CardTitle } from './Card';

describe('Card', () => {
  it('默认渲染 elevated 变体的基础类名,且不可交互(无 tabIndex / 无 interactive 类)', () => {
    render(<Card data-testid="card">内容</Card>);
    const card = screen.getByTestId('card');

    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('ms-card', 'ms-card--elevated');
    expect(card).not.toHaveClass('ms-card--interactive');
    expect(card).not.toHaveAttribute('tabindex');
    expect(card).toHaveTextContent('内容');
  });

  it('variant="outline" 时使用 outline 变体类名', () => {
    render(
      <Card variant="outline" data-testid="card">
        描边卡片
      </Card>,
    );
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('ms-card--outline');
    expect(card).not.toHaveClass('ms-card--elevated');
  });

  it('interactive 时补 interactive 类并默认 tabIndex=0,显式 tabIndex 优先', () => {
    const { rerender } = render(
      <Card interactive data-testid="card">
        可交互
      </Card>,
    );
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('ms-card--interactive');
    expect(card).toHaveAttribute('tabindex', '0');

    rerender(
      <Card interactive tabIndex={-1} data-testid="card">
        可交互
      </Card>,
    );
    expect(card).toHaveAttribute('tabindex', '-1');
  });

  it('合并外部 className 并透传原生 div props(如 onClick 回调)', () => {
    const onClick = vi.fn();
    render(
      <Card className="custom-card" onClick={onClick} data-testid="card">
        点我
      </Card>,
    );
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('ms-card', 'ms-card--elevated', 'custom-card');

    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('默认带 tone=neutral 与 padding=md 类,tone/padding 可定制', () => {
    const { rerender } = render(<Card data-testid="card">默认</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('ms-tone-neutral', 'ms-card--pad-md');

    rerender(
      <Card tone="success" padding="none" data-testid="card">
        语义
      </Card>,
    );
    expect(card).toHaveClass('ms-tone-success', 'ms-card--pad-none');
    expect(card).not.toHaveClass('ms-tone-neutral', 'ms-card--pad-md');
  });

  it('interactive 时 Enter / Space 触发 onClick,且不替换用户的 onKeyDown(两者都跑)', () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Card interactive onClick={onClick} onKeyDown={onKeyDown} data-testid="card">
        可激活
      </Card>,
    );
    const card = screen.getByTestId('card');

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: ' ' });
    expect(onKeyDown).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledTimes(2);

    // 非激活键不触发 click,但用户 onKeyDown 仍收到
    fireEvent.keyDown(card, { key: 'a' });
    expect(onKeyDown).toHaveBeenCalledTimes(3);
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('用户在 onKeyDown 里 preventDefault 可阻断内部键盘激活', () => {
    const onClick = vi.fn();
    render(
      <Card interactive onClick={onClick} onKeyDown={(e) => e.preventDefault()} data-testid="card">
        拦截
      </Card>,
    );
    fireEvent.keyDown(screen.getByTestId('card'), { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('非 interactive 时 Enter 不触发 onClick', () => {
    const onClick = vi.fn();
    render(
      <Card onClick={onClick} data-testid="card">
        静态
      </Card>,
    );
    fireEvent.keyDown(screen.getByTestId('card'), { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('asChild 把卡片样式与 props 合并到子元素(渲染为 <a>),事件 compose 两边都跑', () => {
    const cardClick = vi.fn();
    const linkClick = vi.fn();
    render(
      <Card interactive asChild tone="info" onClick={cardClick} data-testid="card">
        {/* biome-ignore lint/a11y/useValidAnchor: 测试用占位锚点 */}
        <a href="#go" onClick={linkClick}>
          链接卡片
        </a>
      </Card>,
    );
    const link = screen.getByRole('link', { name: '链接卡片' });

    expect(link.tagName).toBe('A');
    expect(link).toHaveClass('ms-card', 'ms-card--interactive', 'ms-tone-info');
    expect(link).toHaveAttribute('href', '#go');
    expect(link).toHaveAttribute('tabindex', '0');

    fireEvent.click(link);
    expect(linkClick).toHaveBeenCalledTimes(1);
    expect(cardClick).toHaveBeenCalledTimes(1);
  });

  it('子部件渲染对应 part 类与内容(Header/Title/Body/Footer/Media)', () => {
    render(
      <Card data-testid="card">
        <CardMedia data-testid="media" src="/x.png" alt="封面" ratio="16 / 9" />
        <CardHeader data-testid="header" action={<button type="button">更多</button>}>
          <CardTitle subtitle="副标题文案">标题</CardTitle>
        </CardHeader>
        <CardBody data-testid="body">正文内容</CardBody>
        <CardFooter data-testid="footer" align="between">
          <button type="button">取消</button>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByTestId('header')).toHaveClass('ms-card__header');
    expect(screen.getByTestId('body')).toHaveClass('ms-card__body');
    expect(screen.getByTestId('footer')).toHaveClass('ms-card__footer', 'ms-card__footer--between');
    expect(screen.getByTestId('media')).toHaveClass('ms-card__media');

    expect(screen.getByRole('heading', { name: '标题' }).tagName).toBe('H3');
    expect(screen.getByText('副标题文案')).toHaveClass('ms-card__subtitle');
    expect(screen.getByText('更多')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '封面' })).toHaveAttribute('src', '/x.png');
    expect(screen.getByTestId('body')).toHaveTextContent('正文内容');
  });

  it('CardTitle as 可调整大纲层级', () => {
    render(<CardTitle as="h2">二级标题</CardTitle>);
    expect(screen.getByRole('heading', { name: '二级标题' }).tagName).toBe('H2');
  });
});
