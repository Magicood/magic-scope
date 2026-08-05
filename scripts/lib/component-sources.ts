/**
 * extract-props 的「扫哪些源文件」逻辑。
 * 单独成模块与 lib/props-doc.ts 同因:extract-props.ts 导入即执行、跑完写盘,无法被测试直接 import;
 * 这段能脱离 react-docgen 独立验证(只碰文件系统),拆出来配套单测(见 scripts/extract-props.test.ts)。
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export interface ComponentSources {
  /** 待解析的源文件(每个目录内主文件在前,其余按名排序)。 */
  files: string[];
  /** 有同名主文件(`<Dir>/<Dir>.tsx`)的目录 —— 守卫①逐目录核对主 displayName 用。 */
  mainDirs: string[];
}

/**
 * 收集组件目录下要送进 react-docgen 的源文件。
 *
 * 必须扫**目录内全部** .tsx,不能只扫同名主文件:公开子部件常写在别的文件里
 * (`Form/Field.tsx` 的 `Form.Field`、`Form/Form.parts.tsx` 的 `Form.Submit` / `Reset` / `List` /
 * `ErrorSummary`),只读主文件会让它们连键都进不了 props.json —— 展示站与 docs 那几段参数表整体消失,
 * 而两条守卫都看不见(守卫①只认目录主键,守卫②只认「已解析出但 0 行」的命名空间子组件)。
 *
 * 排除 `*.test.tsx`(测试件不是公开 API);`.ts`(logic / adapters 等无 JSX 的实现件)本就不含组件,
 * 不进 parser 也就不会产出幽灵 doc。
 *
 * 主文件排最前:跨文件同名 displayName 时以主文件那份为准(归属守卫见 extract-props.ts)。
 * 显式 `.sort()`:readdir 顺序由文件系统决定(APFS 与 ext4 不一致),而 props.json 是已提交产物、
 * CI 在 ubuntu 上与本地 macOS 生成的结果逐字节比对 —— 键序必须与遍历环境无关。
 */
export function collectComponentFiles(componentsDir: string): ComponentSources {
  const dirs = readdirSync(componentsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const files: string[] = [];
  const mainDirs: string[] = [];
  for (const dir of dirs) {
    const names = readdirSync(join(componentsDir, dir), { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith('.tsx') && !e.name.endsWith('.test.tsx'))
      .map((e) => e.name)
      .sort();
    const main = `${dir}.tsx`;
    if (names.includes(main)) mainDirs.push(dir);
    for (const name of [...names.filter((n) => n === main), ...names.filter((n) => n !== main)]) {
      files.push(join(componentsDir, dir, name));
    }
  }
  return { files, mainDirs };
}
