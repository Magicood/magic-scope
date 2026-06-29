// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CopyButton } from './CopyButton';

describe('CopyButton', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    Reflect.deleteProperty(document, 'execCommand');
  });

  it('渲染为 button,默认 aria-label「复制」,带基础类名', () => {
    render(<CopyButton value="hello" />);
    const btn = screen.getByRole('button', { name: '复制' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('type', 'button');
    expect(btn).toHaveClass('ms-copy-button', 'ms-button');
  });

  it('点击写剪贴板并触发 onCopy,切到「已复制」+ data-copied', async () => {
    const onCopy = vi.fn();
    render(<CopyButton value="echo hi" onCopy={onCopy} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('echo hi');
    });
    expect(onCopy).toHaveBeenCalledWith('echo hi');
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: '已复制' });
      expect(btn).toHaveAttribute('data-copied');
    });
  });

  it('timeout 后自动还原成「复制」', async () => {
    vi.useFakeTimers();
    render(<CopyButton value="x" timeout={1500} />);
    fireEvent.click(screen.getByRole('button'));

    // 等微任务(clipboard.writeText 的 then)落地后再推进定时器
    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: '已复制' })).toBeInTheDocument();
    });
    vi.advanceTimersByTime(1500);
    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: '复制' })).toBeInTheDocument();
    });
  });

  it('剪贴板不可用时触发 onError,不切换已复制态', async () => {
    // 去掉 clipboard 且让 execCommand 失败(jsdom 无 execCommand,直接挂一个返回 false 的)
    Object.assign(navigator, { clipboard: undefined });
    (document as Document & { execCommand?: () => boolean }).execCommand = vi
      .fn()
      .mockReturnValue(false);
    const onError = vi.fn();
    const onCopy = vi.fn();
    render(<CopyButton value="x" onCopy={onCopy} onError={onError} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
    });
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect(onCopy).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '复制' })).toBeInTheDocument();
  });

  it('render-prop children 收到 copied 状态', async () => {
    render(
      <CopyButton value="x" withTooltip={false}>
        {(copied) => <span data-testid="rp">{copied ? '好了' : '点我'}</span>}
      </CopyButton>,
    );
    expect(screen.getByTestId('rp')).toHaveTextContent('点我');
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByTestId('rp')).toHaveTextContent('好了');
    });
  });

  it('icon / copiedIcon 覆盖默认图标', async () => {
    render(
      <CopyButton
        value="x"
        withTooltip={false}
        icon={<span data-testid="ico">C</span>}
        copiedIcon={<span data-testid="ico-done">D</span>}
      />,
    );
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByTestId('ico-done')).toBeInTheDocument();
    });
  });

  it('自定义 aria-label 覆盖默认「复制 / 已复制」', () => {
    render(<CopyButton value="x" aria-label="拷贝令牌" />);
    expect(screen.getByRole('button', { name: '拷贝令牌' })).toBeInTheDocument();
  });

  it('tone / size / variant 透传到底层 Button 类名', () => {
    render(<CopyButton value="x" tone="success" size="lg" variant="outline" />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('ms-tone-success', 'ms-button--lg', 'ms-button--outline');
  });

  it('用户 onClick 先执行;preventDefault 可阻断复制', async () => {
    const onClick = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(<CopyButton value="x" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
    // preventDefault 后不应写剪贴板
    await Promise.resolve();
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('成功复制后存在 aria-live=polite 播报区且含「已复制」', async () => {
    const { container } = render(<CopyButton value="x" />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      const live = container.querySelector('[aria-live="polite"]');
      expect(live).toHaveTextContent('已复制');
    });
  });

  it('连续两次复制时 aria-live 文本/计数变化以触发重播(回归:bail-out 导致不重播)', async () => {
    const { container } = render(<CopyButton value="x" timeout={100000} />);
    const live = container.querySelector('[aria-live="polite"]') as HTMLElement;
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(live).toHaveAttribute('data-announce', '1');
    });
    const firstText = live.textContent;
    expect(firstText).toContain('已复制');

    // timeout 还原窗口内再点(copied 仍为 true),文本节点必须变化才会重播
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(live).toHaveAttribute('data-announce', '2');
    });
    expect(live.textContent).not.toBe(firstText);
    expect(live.textContent).toContain('已复制');
  });

  it('复制 await 解析前卸载:解析后不报错、不 setState(回归:无挂载守卫)', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // 手控 resolve,让我们能在 await 未落地时卸载组件
    let resolveWrite: (() => void) | undefined;
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(
          () =>
            new Promise<void>((res) => {
              resolveWrite = res;
            }),
        ),
      },
    });
    const onCopy = vi.fn();
    const { unmount } = render(<CopyButton value="x" onCopy={onCopy} />);
    fireEvent.click(screen.getByRole('button'));
    // 在 writeText 的 promise 解析前卸载
    unmount();
    // 现在让 writeClipboard 落地,copy() 应在挂载守卫处 return
    resolveWrite?.();
    await Promise.resolve();
    await Promise.resolve();

    // 卸载后不应再触发 onCopy(setState 路径),也不应有 React 卸载后 setState 警告
    expect(onCopy).not.toHaveBeenCalled();
    expect(errSpy).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('转发 ref 到底层 button', () => {
    const ref = vi.fn();
    render(<CopyButton value="x" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });
});
