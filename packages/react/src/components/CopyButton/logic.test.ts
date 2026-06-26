// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyMessageKey, writeClipboard } from './logic';

describe('copyMessageKey', () => {
  it('未复制返回 typography.copy', () => {
    expect(copyMessageKey(false)).toBe('typography.copy');
  });

  it('已复制返回 typography.copied', () => {
    expect(copyMessageKey(true)).toBe('typography.copied');
  });
});

describe('writeClipboard', () => {
  // jsdom 不实现 document.execCommand,故直接挂一个可替换的函数(spyOn 无现成属性可挂)。
  const docWithExec = document as Document & { execCommand?: (cmd: string) => boolean };

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Reflect.deleteProperty(document, 'execCommand');
  });

  it('优先走 navigator.clipboard.writeText,成功返回 true', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    await expect(writeClipboard('hello')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('clipboard API reject 时回退 execCommand,execCommand 成功则 true', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const execCommand = vi.fn().mockReturnValue(true);
    docWithExec.execCommand = execCommand;

    await expect(writeClipboard('fallback')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalled();
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('无 clipboard API(非安全上下文)直接走 execCommand 兜底', async () => {
    vi.stubGlobal('navigator', {});
    const execCommand = vi.fn().mockReturnValue(true);
    docWithExec.execCommand = execCommand;

    await expect(writeClipboard('x')).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('execCommand 返回 false 时整体 false', async () => {
    vi.stubGlobal('navigator', {});
    docWithExec.execCommand = vi.fn().mockReturnValue(false);

    await expect(writeClipboard('x')).resolves.toBe(false);
  });

  it('execCommand 抛错也被吞掉返回 false(绝不抛)', async () => {
    vi.stubGlobal('navigator', {});
    docWithExec.execCommand = vi.fn().mockImplementation(() => {
      throw new Error('boom');
    });

    await expect(writeClipboard('x')).resolves.toBe(false);
  });
});
