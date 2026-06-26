// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { useMessages } from '../../i18n';
import { ConfigProvider, useConfig } from './ConfigProvider';

describe('ConfigProvider', () => {
  it('默认渲染 div 根并带组件基础类名,透传 children', () => {
    render(
      <ConfigProvider data-testid="cfg">
        <span>内容</span>
      </ConfigProvider>,
    );
    const root = screen.getByTestId('cfg');
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveClass('ms-config-provider');
    expect(root).toHaveTextContent('内容');
  });

  it('把开关解析为根上的 data-ms-* 属性(motion/fx 友好别名归一)', () => {
    render(
      <ConfigProvider data-testid="cfg" density="compact" motion="off" fx="on" tone="accent" />,
    );
    const root = screen.getByTestId('cfg');
    expect(root).toHaveAttribute('data-ms-density', 'compact');
    expect(root).toHaveAttribute('data-ms-motion', 'off');
    expect(root).toHaveAttribute('data-ms-fx', 'full');
    expect(root).toHaveAttribute('data-ms-tone', 'accent');
  });

  it('只设部分开关时,未设的 data-ms-* 不出现', () => {
    render(<ConfigProvider data-testid="cfg" density="spacious" />);
    const root = screen.getByTestId('cfg');
    expect(root).toHaveAttribute('data-ms-density', 'spacious');
    expect(root).not.toHaveAttribute('data-ms-motion');
    expect(root).not.toHaveAttribute('data-ms-fx');
    expect(root).not.toHaveAttribute('data-ms-tone');
  });

  it('locale 写到根 lang;reduced → data-ms-motion=subtle', () => {
    render(<ConfigProvider data-testid="cfg" locale="zh-CN" motion="reduced" />);
    const root = screen.getByTestId('cfg');
    expect(root).toHaveAttribute('lang', 'zh-CN');
    expect(root).toHaveAttribute('data-ms-motion', 'subtle');
  });

  it('as 多态根渲染指定标签', () => {
    render(
      <ConfigProvider as="section" data-testid="cfg" tone="success">
        x
      </ConfigProvider>,
    );
    const root = screen.getByTestId('cfg');
    expect(root.tagName).toBe('SECTION');
    expect(root).toHaveAttribute('data-ms-tone', 'success');
  });

  it('forwardRef 指向根元素', () => {
    const ref = createRef<HTMLElement>();
    render(<ConfigProvider ref={ref} data-testid="cfg" />);
    expect(ref.current).toBe(screen.getByTestId('cfg'));
  });

  it('asChild 把 data-ms-* / lang / 类名合并到子元素,不额外包 div', () => {
    render(
      <ConfigProvider asChild density="compact" fx="off" locale="en" className="extra">
        <main data-testid="host">内容</main>
      </ConfigProvider>,
    );
    const host = screen.getByTestId('host');
    expect(host.tagName).toBe('MAIN');
    expect(host).toHaveClass('ms-config-provider');
    expect(host).toHaveClass('extra');
    expect(host).toHaveAttribute('data-ms-density', 'compact');
    expect(host).toHaveAttribute('data-ms-fx', 'off');
    expect(host).toHaveAttribute('lang', 'en');
    expect(host).toHaveTextContent('内容');
  });

  it('useConfig 暴露 density/size/tone 默认值供 JS 读', () => {
    function Probe() {
      const { density, size, tone } = useConfig();
      return <span data-testid="probe">{`${density}|${size}|${tone}`}</span>;
    }
    render(
      <ConfigProvider density="spacious" size="lg" tone="info">
        <Probe />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('spacious|lg|info');
  });

  it('无祖先 Provider 时 useConfig 返回全 undefined 兜底', () => {
    function Probe() {
      const { density, size, tone } = useConfig();
      return <span data-testid="probe">{`${density}|${size}|${tone}`}</span>;
    }
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('undefined|undefined|undefined');
  });

  it('嵌套时就近覆盖默认值', () => {
    function Probe() {
      const { density } = useConfig();
      return <span data-testid="probe">{density}</span>;
    }
    render(
      <ConfigProvider density="comfortable">
        <ConfigProvider density="compact">
          <Probe />
        </ConfigProvider>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('compact');
  });

  it('嵌套时继承父级未设字段(子只设 density,size/tone 继承父级而非变 undefined)', () => {
    function Probe() {
      const { density, size, tone } = useConfig();
      return <span data-testid="probe">{`${density}|${size}|${tone}`}</span>;
    }
    render(
      <ConfigProvider tone="success" size="lg">
        <ConfigProvider density="compact">
          <Probe />
        </ConfigProvider>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('compact|lg|success');
  });

  it('给 messages 时经 MessagesProvider 下发,useMessages 取到覆盖文案', () => {
    function Probe() {
      const t = useMessages();
      return <span data-testid="probe">{t('spinner.label', undefined, '回退')}</span>;
    }
    render(
      <ConfigProvider messages={{ 'spinner.label': '施法中' }}>
        <Probe />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('施法中');
  });

  it('不给 messages 时不报错且透传父级文案(回退默认)', () => {
    function Probe() {
      const t = useMessages();
      return <span data-testid="probe">{t('spinner.label')}</span>;
    }
    render(
      <ConfigProvider>
        <Probe />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('加载中');
  });

  it('透传原生属性与 style 到根', () => {
    render(
      <ConfigProvider
        data-testid="cfg"
        role="region"
        aria-label="主题区"
        style={{ color: 'red' }}
      />,
    );
    const root = screen.getByTestId('cfg');
    expect(root).toHaveAttribute('role', 'region');
    expect(root).toHaveAttribute('aria-label', '主题区');
    expect(root).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
