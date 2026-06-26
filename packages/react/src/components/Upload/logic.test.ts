import { describe, expect, it } from 'vitest';
import {
  applyMaxCount,
  canTransition,
  clampPercent,
  formatFileSize,
  isAccepted,
  makeUid,
  nextStatus,
  patchFile,
  removeFile,
  type UploadFile,
  wrapFile,
} from './logic';

// 轻量构造一个 File(jsdom 不需要,Node 18+ 全局有 File;退化时用最小桩)。
function makeFile(name: string, type = '', size = 0): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

describe('makeUid', () => {
  it('每次返回不同的 uid', () => {
    const a = makeUid();
    const b = makeUid();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^ms-upload-/);
  });
});

describe('wrapFile', () => {
  it('把 File 规范化为 pending/0% 的 UploadFile 并留存 raw', () => {
    const file = makeFile('a.png', 'image/png', 3);
    const wrapped = wrapFile(file);
    expect(wrapped).toMatchObject({
      name: 'a.png',
      type: 'image/png',
      status: 'pending',
      percent: 0,
    });
    expect(wrapped.size).toBe(3);
    expect(wrapped.raw).toBe(file);
    expect(wrapped.uid).toBeTruthy();
  });

  it('overrides 可覆盖默认字段(如注入 url / status)', () => {
    const wrapped = wrapFile(makeFile('b.pdf', 'application/pdf'), {
      status: 'done',
      percent: 100,
      url: 'https://x/b.pdf',
    });
    expect(wrapped.status).toBe('done');
    expect(wrapped.percent).toBe(100);
    expect(wrapped.url).toBe('https://x/b.pdf');
  });
});

describe('isAccepted', () => {
  it('accept 为空一律放行', () => {
    expect(isAccepted({ name: 'x.exe', type: 'application/octet-stream' })).toBe(true);
    expect(isAccepted({ name: 'x.exe', type: '' }, '')).toBe(true);
    expect(isAccepted({ name: 'x.exe', type: '' }, '   ')).toBe(true);
  });

  it('扩展名匹配大小写不敏感', () => {
    expect(isAccepted({ name: 'photo.PNG', type: '' }, '.png')).toBe(true);
    expect(isAccepted({ name: 'doc.txt', type: '' }, '.png,.jpg')).toBe(false);
  });

  it('MIME 通配 image/* 匹配大类', () => {
    expect(isAccepted({ name: 'a', type: 'image/jpeg' }, 'image/*')).toBe(true);
    expect(isAccepted({ name: 'a', type: 'video/mp4' }, 'image/*')).toBe(false);
  });

  it('精确 MIME 匹配', () => {
    expect(isAccepted({ name: 'a', type: 'application/pdf' }, 'application/pdf')).toBe(true);
    expect(isAccepted({ name: 'a', type: 'application/json' }, 'application/pdf')).toBe(false);
  });

  it('多条 accept 任一命中即放行', () => {
    expect(isAccepted({ name: 'a.csv', type: 'text/csv' }, 'image/*, .csv ,application/pdf')).toBe(
      true,
    );
  });
});

describe('formatFileSize', () => {
  it('0 / 负数 / NaN 归零', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(-5)).toBe('0 B');
    expect(formatFileSize(Number.NaN)).toBe('0 B');
  });

  it('字节段不带小数', () => {
    expect(formatFileSize(512)).toBe('512 B');
  });

  it('KB/MB 按 1024 进制并去尾零', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
  });
});

describe('状态流转 canTransition / nextStatus', () => {
  it('合法迁移', () => {
    expect(canTransition('pending', 'uploading')).toBe(true);
    expect(canTransition('uploading', 'done')).toBe(true);
    expect(canTransition('uploading', 'error')).toBe(true);
    expect(canTransition('error', 'uploading')).toBe(true);
    expect(canTransition('done', 'removed')).toBe(true);
  });

  it('非法迁移被拒', () => {
    expect(canTransition('done', 'uploading')).toBe(false);
    expect(canTransition('removed', 'uploading')).toBe(false);
    expect(canTransition('pending', 'done')).toBe(false);
  });

  it('nextStatus 非法时原样返回,合法时推进', () => {
    expect(nextStatus('done', 'uploading')).toBe('done');
    expect(nextStatus('error', 'uploading')).toBe('uploading');
  });
});

describe('clampPercent', () => {
  it('夹取到 0–100 整数', () => {
    expect(clampPercent(-10)).toBe(0);
    expect(clampPercent(150)).toBe(100);
    expect(clampPercent(33.6)).toBe(34);
    expect(clampPercent(Number.NaN)).toBe(0);
  });
});

describe('patchFile / removeFile', () => {
  const list: UploadFile[] = [
    { uid: '1', name: 'a', size: 1, type: '', status: 'pending', percent: 0 },
    { uid: '2', name: 'b', size: 2, type: '', status: 'uploading', percent: 40 },
  ];

  it('patchFile 局部更新指定 uid 且不改原数组', () => {
    const next = patchFile(list, '2', { percent: 80, status: 'uploading' });
    expect(next[1]?.percent).toBe(80);
    expect(list[1]?.percent).toBe(40);
    expect(next).not.toBe(list);
  });

  it('removeFile 按 uid 移除', () => {
    const next = removeFile(list, '1');
    expect(next).toHaveLength(1);
    expect(next[0]?.uid).toBe('2');
  });
});

describe('applyMaxCount', () => {
  it('未给 maxCount 全部接纳', () => {
    const { accepted, rejected } = applyMaxCount(0, [1, 2, 3]);
    expect(accepted).toEqual([1, 2, 3]);
    expect(rejected).toEqual([]);
  });

  it('按剩余名额截断', () => {
    const { accepted, rejected } = applyMaxCount(2, [10, 11, 12], 3);
    expect(accepted).toEqual([10]);
    expect(rejected).toEqual([11, 12]);
  });

  it('名额已满则全拒', () => {
    const { accepted, rejected } = applyMaxCount(3, [10, 11], 3);
    expect(accepted).toEqual([]);
    expect(rejected).toEqual([10, 11]);
  });
});
