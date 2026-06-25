/**
 * 从组件真实 TS 类型自动抽取 props → playground/showcase/generated/props.json。
 * 唯一真相源:组件源文件;禁止手抄(对应 CI 红线)。
 * 用法:tsx scripts/extract-props.ts [--check]
 *   --check:只校验,不写盘(给 CI 用,检测 props.json 是否与源码漂移)。
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { withCompilerOptions } from 'react-docgen-typescript';
import ts from 'typescript';

const COMPONENTS_DIR = 'packages/react/src/components';
const OUT = 'playground/showcase/generated/props.json';

export interface PropRow {
  name: string;
  type: string;
  default: string;
  description: string;
  required: boolean;
}

const parser = withCompilerOptions(
  { jsx: 4 /* react-jsx */, esModuleInterop: true, skipLibCheck: true },
  {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    // 只保留组件自己声明的 props,排除来自 node_modules 的原生 HTML 属性(它们用 ...props 一行概括)。
    propFilter: (prop) => (prop.parent ? !prop.parent.fileName.includes('node_modules') : true),
  },
);

// 收集每个组件目录的主源文件(<Dir>/<Dir>.tsx)。
const dirs = readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const files: string[] = [];
for (const dir of dirs) {
  const main = join(COMPONENTS_DIR, dir, `${dir}.tsx`);
  try {
    readFileSync(main);
    files.push(main);
  } catch {
    // 没有同名主文件的目录跳过。
  }
}

const docs = parser.parse(files);

// displayName → PropRow[](同名多导出合并)。
const out: Record<string, PropRow[]> = {};
for (const doc of docs) {
  const rows: PropRow[] = Object.values(doc.props).map((p) => {
    // enum 优先用 raw 联合字符串;否则拼字面量;再否则用 name。
    const t = p.type as { name?: string; raw?: string; value?: { value: string }[] };
    let typeStr = t.name ?? 'unknown';
    if (t.name === 'enum') {
      if (Array.isArray(t.value)) {
        typeStr = t.value.map((v) => v.value).join(' | ');
      } else if (t.raw) {
        typeStr = t.raw;
      }
    } else if (t.raw && t.name === undefined) {
      typeStr = t.raw;
    }
    return {
      name: p.name,
      type: typeStr.replace(/\s+/g, ' ').trim(),
      default: p.defaultValue?.value != null ? String(p.defaultValue.value) : '—',
      description: (p.description ?? '').trim(),
      required: Boolean(p.required),
    };
  });
  if (rows.length === 0) continue;
  // 同 displayName 合并(如 RadioGroup + Radio 各自一条 displayName,这里按名分别存)。
  out[doc.displayName] = (out[doc.displayName] ?? []).concat(rows);
}

// —— 额外抽取命令式 API 的 *Options 接口 ——
// react-docgen 只抓「组件 props」,toast()/confirm() 的 options 是普通接口,用 TS 编译器 API 补抽。
function extractOptionInterfaces(filePaths: string[]): Record<string, PropRow[]> {
  const program = ts.createProgram(filePaths, {
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
    skipLibCheck: true,
  });
  const checker = program.getTypeChecker();
  const result: Record<string, PropRow[]> = {};
  for (const file of filePaths) {
    const sf = program.getSourceFile(file);
    if (!sf) continue;
    sf.forEachChild((node) => {
      if (!ts.isInterfaceDeclaration(node) || !/Options$/.test(node.name.text)) return;
      const exported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (!exported) return;
      const rows: PropRow[] = [];
      for (const member of node.members) {
        if (!ts.isPropertySignature(member) || !member.name) continue;
        const sym = checker.getSymbolAtLocation(member.name);
        const description = sym
          ? ts.displayPartsToString(sym.getDocumentationComment(checker)).trim()
          : '';
        rows.push({
          name: member.name.getText(sf),
          type: member.type ? member.type.getText(sf).replace(/\s+/g, ' ').trim() : 'unknown',
          default: '—',
          description,
          required: !member.questionToken,
        });
      }
      if (rows.length) result[node.name.text] = rows;
    });
  }
  return result;
}

for (const [name, rows] of Object.entries(extractOptionInterfaces(files))) {
  out[name] = rows;
}

const json = `${JSON.stringify(out, null, 2)}\n`;

if (process.argv.includes('--check')) {
  const existing = (() => {
    try {
      return readFileSync(OUT, 'utf8');
    } catch {
      return '';
    }
  })();
  if (existing.trim() !== json.trim()) {
    console.error('✖ props.json 与源码漂移!请运行 `tsx scripts/extract-props.ts` 重新生成。');
    process.exit(1);
  }
  console.log('✓ props.json 与源码一致');
} else {
  writeFileSync(OUT, json, 'utf8');
  const names = Object.keys(out);
  console.log(
    `已写入 ${OUT}:${names.length} 个组件,共 ${Object.values(out).reduce((s, r) => s + r.length, 0)} 行 props`,
  );
}
