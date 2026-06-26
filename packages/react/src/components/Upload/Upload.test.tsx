// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Upload, type UploadFile, type UploadRequestOption } from './Upload';

function makeFile(name: string, type = 'text/plain', size = 4): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

describe('Upload', () => {
  it('渲染触发区(role=button)+ 默认 i18n 文案 + 隐藏 input', () => {
    render(<Upload />);
    const trigger = screen.getByRole('button', { name: /上传/ });
    expect(trigger).toBeInTheDocument();
    // 隐藏的 file input 存在
    const root = trigger.closest('.ms-upload');
    const input = root?.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
  });

  it('点击触发区会点击隐藏 input(打开文件选择器)', () => {
    render(<Upload />);
    const trigger = screen.getByRole('button', { name: /上传/ });
    const input = trigger
      .closest('.ms-upload')
      ?.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    fireEvent.click(trigger);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('键盘 Enter / Space 触发文件选择', () => {
    render(<Upload />);
    const trigger = screen.getByRole('button', { name: /上传/ });
    const input = trigger
      .closest('.ms-upload')
      ?.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  it('选择文件后入列并触发 onChange(展示名与体积)', () => {
    const onChange = vi.fn();
    render(<Upload onChange={onChange} />);
    const input = screen
      .getByRole('button', { name: /上传/ })
      .closest('.ms-upload')
      ?.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('hello.txt', 'text/plain', 2048)] } });
    expect(onChange).toHaveBeenCalledTimes(1);
    const list = onChange.mock.calls[0]?.[0] as UploadFile[];
    expect(list).toHaveLength(1);
    expect(list[0]?.name).toBe('hello.txt');
    expect(screen.getByText('hello.txt')).toBeInTheDocument();
    expect(screen.getByText('2 KB')).toBeInTheDocument();
  });

  it('accept 过滤掉不匹配的文件', () => {
    const onChange = vi.fn();
    render(<Upload accept=".png" multiple onChange={onChange} />);
    const input = screen
      .getByRole('button', { name: /上传/ })
      .closest('.ms-upload')
      ?.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [makeFile('a.png', 'image/png'), makeFile('b.txt', 'text/plain')] },
    });
    const list = onChange.mock.calls[0]?.[0] as UploadFile[];
    expect(list).toHaveLength(1);
    expect(list[0]?.name).toBe('a.png');
  });

  it('maxCount 限制入列条数', () => {
    const onChange = vi.fn();
    render(<Upload multiple maxCount={1} onChange={onChange} />);
    const input = screen
      .getByRole('button', { name: /上传/ })
      .closest('.ms-upload')
      ?.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [makeFile('a.txt'), makeFile('b.txt')] },
    });
    const list = onChange.mock.calls[0]?.[0] as UploadFile[];
    expect(list).toHaveLength(1);
  });

  it('beforeUpload 返回 false 阻止入列', async () => {
    const onChange = vi.fn();
    render(<Upload beforeUpload={() => false} onChange={onChange} />);
    const input = screen
      .getByRole('button', { name: /上传/ })
      .closest('.ms-upload')
      ?.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('x.txt')] } });
    // beforeUpload 是异步链路,等微任务
    await Promise.resolve();
    await Promise.resolve();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('受控 fileList 渲染删除按钮,点击触发 onRemove', () => {
    const onRemove = vi.fn();
    const onChange = vi.fn();
    const fileList: UploadFile[] = [
      { uid: '1', name: 'done.png', size: 10, type: 'image/png', status: 'done', percent: 100 },
    ];
    render(<Upload fileList={fileList} onRemove={onRemove} onChange={onChange} />);
    const removeBtn = screen.getByRole('button', { name: /删除 done.png/ });
    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('error 态显示重试按钮,点击重新调用 customRequest', () => {
    const customRequest = vi.fn();
    const fileList: UploadFile[] = [
      {
        uid: '1',
        name: 'fail.txt',
        size: 10,
        type: 'text/plain',
        status: 'error',
        percent: 0,
        raw: makeFile('fail.txt'),
      },
    ];
    render(<Upload fileList={fileList} customRequest={customRequest} />);
    const retryBtn = screen.getByRole('button', { name: /重试 fail.txt/ });
    fireEvent.click(retryBtn);
    expect(customRequest).toHaveBeenCalledTimes(1);
  });

  it('受控注入无 raw 的 error 条目不渲染重试按钮(避免死按钮)', () => {
    const customRequest = vi.fn();
    const fileList: UploadFile[] = [
      {
        uid: '1',
        name: 'fail.txt',
        size: 10,
        type: 'text/plain',
        status: 'error',
        percent: 0,
        // 无 raw:startRequest 会因 !item.raw 静默 return,重试按钮必须不渲染
      },
    ];
    render(<Upload fileList={fileList} customRequest={customRequest} />);
    expect(screen.queryByRole('button', { name: /重试 fail.txt/ })).not.toBeInTheDocument();
  });

  it('迟到的 onProgress 在已终态(done)后不再篡改 percent', () => {
    let captured: UploadRequestOption | null = null;
    const customRequest = vi.fn((opt: UploadRequestOption) => {
      captured = opt;
    });
    const onChange = vi.fn();
    render(<Upload customRequest={customRequest} onChange={onChange} />);
    const input = screen
      .getByRole('button', { name: /上传/ })
      .closest('.ms-upload')
      ?.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('go.txt')] } });
    // 先成功置 done(percent=100)
    act(() => captured?.handlers.onSuccess({ url: 'https://x/go.txt' }));
    let last = onChange.mock.calls.at(-1)?.[0] as UploadFile[];
    expect(last[0]?.status).toBe('done');
    expect(last[0]?.percent).toBe(100);
    const callsAfterSuccess = onChange.mock.calls.length;
    // 迟到的进度回报不得改写已终态条目
    act(() => captured?.handlers.onProgress(42));
    expect(onChange.mock.calls.length).toBe(callsAfterSuccess);
    last = onChange.mock.calls.at(-1)?.[0] as UploadFile[];
    expect(last[0]?.status).toBe('done');
    expect(last[0]?.percent).toBe(100);
  });

  it('customRequest 经 onProgress/onSuccess 推进 status 与 percent', () => {
    let captured: UploadRequestOption | null = null;
    const customRequest = vi.fn((opt: UploadRequestOption) => {
      captured = opt;
    });
    const onChange = vi.fn();
    render(<Upload customRequest={customRequest} onChange={onChange} />);
    const input = screen
      .getByRole('button', { name: /上传/ })
      .closest('.ms-upload')
      ?.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile('go.txt')] } });
    expect(customRequest).toHaveBeenCalled();
    // 推进进度
    act(() => captured?.handlers.onProgress(50));
    let last = onChange.mock.calls.at(-1)?.[0] as UploadFile[];
    expect(last[0]?.status).toBe('uploading');
    expect(last[0]?.percent).toBe(50);
    // 成功
    act(() => captured?.handlers.onSuccess({ url: 'https://x/go.txt' }));
    last = onChange.mock.calls.at(-1)?.[0] as UploadFile[];
    expect(last[0]?.status).toBe('done');
    expect(last[0]?.percent).toBe(100);
    expect(last[0]?.url).toBe('https://x/go.txt');
  });

  it('drop 文件触发收集(dragover preventDefault 让 drop 生效)', () => {
    const onChange = vi.fn();
    render(<Upload onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: /上传/ });
    fireEvent.dragOver(trigger);
    expect(trigger).toHaveAttribute('data-dragover');
    fireEvent.drop(trigger, { dataTransfer: { files: [makeFile('drop.txt')] } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(trigger).not.toHaveAttribute('data-dragover');
  });

  it('disabled 时点击与 drop 不收文件', () => {
    const onChange = vi.fn();
    render(<Upload disabled onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: /上传/ });
    const input = trigger
      .closest('.ms-upload')
      ?.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    fireEvent.click(trigger);
    expect(clickSpy).not.toHaveBeenCalled();
    fireEvent.drop(trigger, { dataTransfer: { files: [makeFile('x.txt')] } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('listType=picture 渲染缩略容器', () => {
    const fileList: UploadFile[] = [
      {
        uid: '1',
        name: 'p.png',
        size: 10,
        type: 'image/png',
        status: 'done',
        percent: 100,
        url: 'data:,',
      },
    ];
    const { container } = render(<Upload listType="picture" fileList={fileList} />);
    expect(container.querySelector('.ms-upload__thumb')).toBeInTheDocument();
    expect(container.querySelector('.ms-upload--picture')).toBeInTheDocument();
  });

  it('转发 ref 到根容器并透传原生属性', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Upload ref={ref} data-testid="up" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('ms-upload');
    expect(screen.getByTestId('up')).toBeInTheDocument();
  });
});
