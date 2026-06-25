// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('当前页标记 aria-current', () => {
    render(<Pagination page={2} total={5} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: '第 2 页' })).toHaveAttribute('aria-current', 'page');
  });

  it('点击页码触发 onPageChange', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} total={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole('button', { name: '第 3 页' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
