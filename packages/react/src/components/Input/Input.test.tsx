// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('invalid 设 aria-invalid 与修饰类', () => {
    render(<Input invalid placeholder="p" />);
    const input = screen.getByPlaceholderText('p');
    expect(input).toHaveClass('ms-input--invalid');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('size 映射尺寸类名', () => {
    render(<Input size="lg" placeholder="q" />);
    expect(screen.getByPlaceholderText('q')).toHaveClass('ms-input--lg');
  });
});
