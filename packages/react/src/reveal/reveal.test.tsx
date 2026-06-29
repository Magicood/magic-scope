// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { observe, Reveal, RevealGroup } from './index';

/** 读 reveal.css 原文验证框架无关契约(jsdom 不解析外部 CSS,直接断言规则文本)。 */
const revealCss = readFileSync(join(process.cwd(), 'packages/react/src/reveal/reveal.css'), 'utf8');

describe('observe(单例 observer)', () => {
  it('环境无 IntersectionObserver 时立即回调可见 —— 内容绝不卡隐藏态(SSR/降级兜底)', () => {
    let seen: boolean | null = null;
    const stop = observe(document.createElement('div'), (v) => {
      seen = v;
    });
    expect(seen).toBe(true);
    stop();
  });
});

describe('<Reveal>', () => {
  it('默认渲染 data-ms-reveal="up"', () => {
    const { container } = render(<Reveal>hi</Reveal>);
    expect(container.querySelector('[data-ms-reveal]')).toHaveAttribute('data-ms-reveal', 'up');
  });

  it('variant 透传到 data-ms-reveal', () => {
    const { container } = render(<Reveal variant="zoom-in">x</Reveal>);
    expect(container.querySelector('[data-ms-reveal]')).toHaveAttribute(
      'data-ms-reveal',
      'zoom-in',
    );
  });

  it('数值 props 落成行内 CSS 变量(不生成新 class)', () => {
    const { container } = render(
      <Reveal distance={40} delay={120} stagger={50}>
        x
      </Reveal>,
    );
    const el = container.querySelector('[data-ms-reveal]') as HTMLElement;
    expect(el.style.getPropertyValue('--ms-reveal-distance')).toBe('40px');
    expect(el.style.getPropertyValue('--ms-reveal-delay')).toBe('120ms');
    expect(el.style.getPropertyValue('--ms-reveal-stagger')).toBe('50ms');
  });

  it('trigger="scrub" 不加 data-ms-inview(交给 CSS animation-timeline)', () => {
    const { container } = render(
      <Reveal variant="parallax" trigger="scrub">
        x
      </Reveal>,
    );
    const el = container.querySelector('[data-ms-reveal]');
    expect(el).toHaveAttribute('data-ms-reveal', 'parallax');
    expect(el).not.toHaveAttribute('data-ms-inview');
  });

  it('as 多态渲染指定标签', () => {
    const { container } = render(
      <Reveal as="section" variant="fade">
        x
      </Reveal>,
    );
    expect(container.querySelector('section[data-ms-reveal="fade"]')).toBeTruthy();
  });

  it('text-words 拆词为多个单元,aria-label 保原文给屏幕阅读器', () => {
    const { container } = render(<Reveal variant="text-words">hello brave world</Reveal>);
    const root = container.querySelector('[data-ms-reveal="text-words"]');
    expect(root).toHaveAttribute('aria-label', 'hello brave world');
    expect(container.querySelectorAll('[data-ms-reveal-line]').length).toBeGreaterThan(1);
  });
});

describe('<RevealGroup>', () => {
  it('给直接子项注入递增 --i 与默认 data-ms-reveal', () => {
    const { container } = render(
      <RevealGroup variant="up" stagger={80}>
        <div>a</div>
        <div>b</div>
        <div>c</div>
      </RevealGroup>,
    );
    const kids = Array.from(container.querySelectorAll('[data-ms-reveal]')) as HTMLElement[];
    expect(kids.length).toBe(3);
    expect(kids[0]).toHaveAttribute('data-ms-reveal', 'up');
    expect(kids[0].style.getPropertyValue('--i')).toBe('0');
    expect(kids[2].style.getPropertyValue('--i')).toBe('2');
  });

  it('order="reverse" 反转序号', () => {
    const { container } = render(
      <RevealGroup order="reverse">
        <div>a</div>
        <div>b</div>
      </RevealGroup>,
    );
    const kids = Array.from(container.querySelectorAll('[data-ms-reveal]')) as HTMLElement[];
    expect(kids[0].style.getPropertyValue('--i')).toBe('1');
    expect(kids[1].style.getPropertyValue('--i')).toBe('0');
  });
});

describe('reveal.css 契约', () => {
  it('位移/缩放/模糊量统一乘 --ms-motion-scale(三轴调制,关档归零)', () => {
    expect(revealCss).toContain('--ms-motion-scale');
    expect(revealCss).toMatch(/data-ms-reveal="up"/);
    expect(revealCss).toContain('data-ms-inview');
  });

  it('一次性 reveal 走 transition、扫光/视差走 animation-timeline', () => {
    expect(revealCss).toContain('transition-property');
    expect(revealCss).toContain('animation-timeline');
    expect(revealCss).toContain('prefers-reduced-motion');
  });
});
