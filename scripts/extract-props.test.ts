/**
 * extract-props 的纯逻辑红线(scripts/lib/props-doc.ts)。
 * 这套抽取脚本长期零测试覆盖,两类回归都曾静默发生并写进已提交的 props.json:
 *   1. @param 只按 prop 名建索引 → 同文件里不同接口的同名事件互相覆盖(跨接口串味);
 *   2. 说明清洗一刀切截断块级标签 → 只有 @deprecated 的 prop 说明列整个变空。
 * 这里用最小 fixture 把两条都钉住。
 */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';
import { afterAll, describe, expect, it } from 'vitest';
import { cleanDescription, extractParamDocs } from './lib/props-doc';

// 同一文件里三个声明:两个接口各自声明同名事件 onChange(参数含义完全不同),
// 外加一个 type 字面量(react-docgen 对其成员给 parent=undefined,对应 '' 桶)。
// 这正是 Checkbox / CheckboxGroup、Confirm / Alert / PromptOptions 在真实源码里的形态。
const FIXTURE = `
export interface AlphaProps {
  /**
   * 单个控件的原生 change。
   * @param event 内部 input 的原生 change 事件。
   */
  onChange?: (event: unknown) => void;
}

export interface BetaProps {
  /**
   * 分组选中集合变化。
   * @param value 新的选中 value 数组。
   */
  onChange?: (value: string[]) => void;
}

export type GammaProps = {
  /**
   * 字面量类型里的事件。
   * @param open 展开态。
   */
  onToggle?: (open: boolean) => void;
};

export interface DeltaProps {
  /** 不带逐参标注的事件,不应出现在索引里。 */
  onBare?: () => void;
}
`;

const dir = mkdtempSync(join(tmpdir(), 'ms-extract-props-'));
const file = join(dir, 'fixture.ts');
writeFileSync(file, FIXTURE, 'utf8');
const program = ts.createProgram([file], { skipLibCheck: true, noLib: true });
const index = extractParamDocs(program, program.getTypeChecker(), [file]);
const byOwner = index[file] ?? {};

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('extractParamDocs:@param 按声明接口隔离', () => {
  it('同文件两个接口的同名事件各自保留自己的 @param(不互相覆盖)', () => {
    expect(byOwner.AlphaProps?.onChange).toEqual([
      { name: 'event', description: '内部 input 的原生 change 事件。' },
    ]);
    expect(byOwner.BetaProps?.onChange).toEqual([
      { name: 'value', description: '新的选中 value 数组。' },
    ]);
  });

  it('接口桶之间不串味:各桶只含自己声明的事件', () => {
    expect(Object.keys(byOwner.AlphaProps ?? {})).toEqual(['onChange']);
    expect(Object.keys(byOwner.BetaProps ?? {})).toEqual(['onChange']);
  });

  it('type 字面量成员归 "" 桶(对齐 react-docgen 的 PropItem.parent === undefined)', () => {
    expect(byOwner['']?.onToggle).toEqual([{ name: 'open', description: '展开态。' }]);
    // 且不会窜进具名接口桶。
    expect(byOwner.AlphaProps?.onToggle).toBeUndefined();
  });

  it('没有 @param 的事件不建键(下游据此决定是否写 params 字段)', () => {
    expect(byOwner.DeltaProps).toBeUndefined();
  });
});

describe('cleanDescription:@deprecated 正文不再被整块丢弃', () => {
  it('只有 @deprecated 的说明不再变空,正文前置「已废弃:」', () => {
    expect(cleanDescription('@deprecated 用 `tone="danger"` 替代。')).toBe(
      '已废弃:用 `tone="danger"` 替代。',
    );
  });

  it('正文 + @deprecated:废弃提示在前,原摘要保留在后', () => {
    expect(cleanDescription('历史兼容保留。\n@deprecated 本属性已无效果。')).toBe(
      '已废弃:本属性已无效果。 历史兼容保留。',
    );
  });

  it('@deprecated 正文跨行、且到下一个块级标签为止', () => {
    expect(cleanDescription('摘要。\n@deprecated 第一行\n第二行\n@param value 不该被吞进去')).toBe(
      '已废弃:第一行 第二行 摘要。',
    );
  });

  it('keepDeprecated=false(原生透传 prop)只留摘要,不注入 React 官方英文废弃文案', () => {
    const raw = 'Native handler.\n@deprecated Use `onKeyUp` or `onKeyDown` instead';
    expect(cleanDescription(raw, false)).toBe('Native handler.');
  });

  it('无 @deprecated 时行为不变:仍截到第一个块级标签', () => {
    expect(cleanDescription('选中变化回调。\n@param value 新值。')).toBe('选中变化回调。');
  });
});
