// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Image } from './Image';

const SRC = 'https://example.com/a.png';

describe('Image', () => {
  it('渲染 <img> 并带 alt / loading=lazy / decoding', () => {
    render(<Image src={SRC} alt="封面" />);
    const img = screen.getByAltText('封面');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
    expect(img).toHaveAttribute('src', SRC);
  });

  it('lazy=false → loading=eager', () => {
    render(<Image src={SRC} alt="x" lazy={false} />);
    expect(screen.getByAltText('x')).toHaveAttribute('loading', 'eager');
  });

  it('forwardRef 指向 <img>', () => {
    const ref = createRef<HTMLImageElement>();
    render(<Image ref={ref} src={SRC} alt="x" />);
    expect(ref.current).toBeInstanceOf(HTMLImageElement);
  });

  it('fit / rounded 映射到 class', () => {
    const { container } = render(<Image src={SRC} alt="x" fit="contain" rounded="full" />);
    expect(container.querySelector('.ms-image__img--fit-contain')).toBeInTheDocument();
    expect(container.querySelector('.ms-image--rounded-full')).toBeInTheDocument();
  });

  it('width/height 数值转 px 写到根 style', () => {
    const { container } = render(<Image src={SRC} alt="x" width={120} height={80} />);
    const root = container.querySelector('.ms-image') as HTMLElement;
    expect(root.style.width).toBe('120px');
    expect(root.style.height).toBe('80px');
  });

  it('加载前显示骨架,onLoad 后移除并触发回调', () => {
    const onLoad = vi.fn();
    const { container } = render(<Image src={SRC} alt="x" onLoad={onLoad} />);
    expect(container.querySelector('.ms-image__skeleton')).toBeInTheDocument();
    fireEvent.load(screen.getByAltText('x'));
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.ms-image__skeleton')).not.toBeInTheDocument();
  });

  it('onError 沿 fallbackSrc 链逐级降级,末级才触发 onError 错误态', () => {
    const onError = vi.fn();
    const { container } = render(
      <Image src={SRC} alt="x" fallbackSrc="https://example.com/b.png" onError={onError} />,
    );
    const img = screen.getByAltText('x');
    // 主图失败 → 切到 fallback,尚未进错误态
    fireEvent.error(img);
    expect(screen.getByAltText('x')).toHaveAttribute('src', 'https://example.com/b.png');
    expect(onError).not.toHaveBeenCalled();
    // fallback 也失败 → 错误态 + 回调
    fireEvent.error(screen.getByAltText('x'));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.ms-image__error')).toBeInTheDocument();
  });

  it('无 src 直接进错误态(role=img + 错误文案)', () => {
    render(<Image alt="坏图" />);
    const errBox = screen.getByRole('img', { name: '坏图' });
    expect(errBox).toBeInTheDocument();
    expect(screen.getByText('图片加载失败')).toBeInTheDocument();
  });

  it('自定义 fallback 节点替换内建错误态', () => {
    render(<Image alt="" fallback={<span>自定义错误</span>} />);
    expect(screen.getByText('自定义错误')).toBeInTheDocument();
  });

  it('preview=false 时 img 不可交互(无 role=button)', () => {
    render(<Image src={SRC} alt="x" />);
    const img = screen.getByAltText('x');
    expect(img).not.toHaveAttribute('role', 'button');
    fireEvent.click(img);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('preview=true 点击打开灯箱(role=dialog + aria-modal)', () => {
    render(<Image src={SRC} alt="风景" preview />);
    const img = screen.getByRole('button', { name: '预览' });
    fireEvent.click(img);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('风景');
  });

  it('回车键打开灯箱', () => {
    render(<Image src={SRC} alt="x" preview />);
    fireEvent.keyDown(screen.getByRole('button', { name: '预览' }), { key: 'Enter' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('灯箱 Esc 关闭', () => {
    render(<Image src={SRC} alt="x" preview />);
    fireEvent.click(screen.getByRole('button', { name: '预览' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('点击遮罩本身关闭灯箱', () => {
    render(<Image src={SRC} alt="x" preview />);
    fireEvent.click(screen.getByRole('button', { name: '预览' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('工具栏:缩放/旋转改变大图 transform,还原按钮初始禁用', () => {
    render(<Image src={SRC} alt="x" preview />);
    fireEvent.click(screen.getByRole('button', { name: '预览' }));
    const previewImg = document.querySelector('.ms-image__preview-img') as HTMLElement;
    expect(previewImg.style.transform).toBe('scale(1) rotate(0deg)');

    const reset = screen.getByRole('button', { name: '还原' });
    expect(reset).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '放大' }));
    expect(previewImg.style.transform).toBe('scale(1.25) rotate(0deg)');
    expect(reset).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '旋转' }));
    expect(previewImg.style.transform).toBe('scale(1.25) rotate(90deg)');

    fireEvent.click(reset);
    expect(previewImg.style.transform).toBe('scale(1) rotate(0deg)');
  });

  it('键盘 +/- 缩放,0 还原', () => {
    render(<Image src={SRC} alt="x" preview />);
    fireEvent.click(screen.getByRole('button', { name: '预览' }));
    const dialog = screen.getByRole('dialog');
    const previewImg = document.querySelector('.ms-image__preview-img') as HTMLElement;
    fireEvent.keyDown(dialog, { key: '+' });
    expect(previewImg.style.transform).toBe('scale(1.25) rotate(0deg)');
    fireEvent.keyDown(dialog, { key: '-' });
    expect(previewImg.style.transform).toBe('scale(1) rotate(0deg)');
  });

  it('受控 previewOpen + onPreviewOpenChange', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Image src={SRC} alt="x" preview previewOpen={false} onPreviewOpenChange={onChange} />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '预览' }));
    // 受控:点击只回调,不自行打开
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // 外部翻 true 才显示
    rerender(<Image src={SRC} alt="x" preview previewOpen={true} onPreviewOpenChange={onChange} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('toolbarLabels 覆盖工具按钮 aria-label', () => {
    render(<Image src={SRC} alt="x" preview toolbarLabels={{ close: 'Close' }} />);
    fireEvent.click(screen.getByRole('button', { name: '预览' }));
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('classNames 分槽透传到根', () => {
    const { container } = render(<Image src={SRC} alt="x" classNames={{ root: 'my-root' }} />);
    expect(container.querySelector('.ms-image.my-root')).toBeInTheDocument();
  });

  it('用户 onClick 经 compose 保留', () => {
    const userClick = vi.fn();
    render(<Image src={SRC} alt="x" preview onClick={userClick} />);
    fireEvent.click(screen.getByRole('button', { name: '预览' }));
    expect(userClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // 回归(HIGH):内联数组 fallbackSrc 每次父渲染都是新引用,曾导致复位 effect
  // 在无关父重渲染时把 loaded 打回 false、img 卡在骨架/opacity:0。
  it('加载完成后父重渲染(内联数组 fallbackSrc)不复位 loaded', () => {
    const Parent = ({ tick }: { tick: number }) => (
      <div data-tick={tick}>
        <Image src={SRC} alt="x" fallbackSrc={['https://example.com/b.png']} />
      </div>
    );
    const { container, rerender } = render(<Parent tick={0} />);
    // 加载完成
    fireEvent.load(screen.getByAltText('x'));
    expect(container.querySelector('.ms-image__img--loaded')).toBeInTheDocument();
    expect(container.querySelector('.ms-image__skeleton')).not.toBeInTheDocument();

    // 无关父重渲染(每次给 fallbackSrc 传新数组引用)
    rerender(<Parent tick={1} />);
    rerender(<Parent tick={2} />);

    // 仍为 loaded,未被复位回骨架
    expect(container.querySelector('.ms-image__img--loaded')).toBeInTheDocument();
    expect(container.querySelector('.ms-image__skeleton')).not.toBeInTheDocument();
    expect(container.querySelector('.ms-image')).toHaveAttribute('data-loaded', 'true');
  });

  // 回归(LOW):受控重开应复位 transform,而非带上次缩放/旋转。
  it('受控开→缩放→关→再开,transform 已复位', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Image src={SRC} alt="x" preview previewOpen={true} onPreviewOpenChange={onChange} />,
    );
    const dialog = screen.getByRole('dialog');
    const previewImg = document.querySelector('.ms-image__preview-img') as HTMLElement;
    expect(previewImg.style.transform).toBe('scale(1) rotate(0deg)');

    // 受控态缩放 + 旋转
    fireEvent.click(screen.getByRole('button', { name: '放大' }));
    fireEvent.keyDown(dialog, { key: 'r' });
    expect((document.querySelector('.ms-image__preview-img') as HTMLElement).style.transform).toBe(
      'scale(1.25) rotate(90deg)',
    );

    // 受控关闭
    rerender(
      <Image src={SRC} alt="x" preview previewOpen={false} onPreviewOpenChange={onChange} />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // 受控再开 → transform 已复位为初始态
    rerender(<Image src={SRC} alt="x" preview previewOpen={true} onPreviewOpenChange={onChange} />);
    expect((document.querySelector('.ms-image__preview-img') as HTMLElement).style.transform).toBe(
      'scale(1) rotate(0deg)',
    );
  });
});
