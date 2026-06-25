/**
 * 组件生成器 —— 收录流水线的入口。
 * 用法: pnpm new <ComponentName> [category]   例: pnpm new Button actions
 *
 * 生成 packages/react/src/components/<Name>/ 目录骨架 + component.json 溯源模板,
 * 并自动追加到组件出口(components/index.ts)与样式汇总(styles.css)。
 * 硬性约定:新增组件一律走本生成器,不手工建目录。
 */
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { argv, exit } from 'node:process';

const ROOT = join(import.meta.dirname, '..');
const REACT_SRC = join(ROOT, 'packages', 'react', 'src');

const rawName = argv[2];
const category = argv[3] ?? 'misc';
const sourceType = argv[4] ?? 'original';
if (!rawName) {
  console.error(
    '用法: pnpm new <ComponentName> [category] [source-type]\n例:   pnpm new Button actions\n      pnpm new Card layout inspired',
  );
  exit(1);
}
if (sourceType !== 'original' && sourceType !== 'inspired' && sourceType !== 'captured') {
  console.error(`source.type 非法: "${sourceType}"(应为 original / inspired / captured)`);
  exit(1);
}

const Name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
const kebab = Name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const dir = join(REACT_SRC, 'components', Name);
if (existsSync(dir)) {
  console.error(`组件已存在: ${dir}`);
  exit(1);
}
mkdirSync(dir, { recursive: true });

const today = new Date().toISOString().slice(0, 10);

const tsx = `import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export type ${Name}Props = ComponentPropsWithoutRef<'div'>;

/** ${Name} —— 由 pnpm new 生成的骨架,待实现。 */
export const ${Name} = forwardRef<HTMLDivElement, ${Name}Props>(({ className, ...props }, ref) => (
  <div ref={ref} className={['ms-${kebab}', className].filter(Boolean).join(' ')} {...props} />
));
${Name}.displayName = '${Name}';
`;

const css = `.ms-${kebab} {
  /* 用 var(--ms-*) 设计 token 实现样式 */
}
`;

// 按 source.type 给模板:original 免证据;inspired / captured 预置 app 证据占位
// (schema 要求至少一项 url / app / screenshot,否则 pnpm registry 校验失败)。
const source =
  sourceType === 'original'
    ? {
        type: 'original',
        capturedAt: today,
        requirements: 'TODO: 自研意图 / 设计目标(写真实内容,勿照抄 description)',
      }
    : {
        type: sourceType,
        app: 'TODO: 来源应用 / 产品名(或改用 url / screenshot 填证据)',
        capturedAt: today,
        requirements: 'TODO: 收录时的需求原文 / 来源描述(写真实内容)',
      };

const componentJson = {
  id: kebab,
  name: Name,
  description: 'TODO: 一句话描述',
  category,
  tags: [],
  status: 'draft',
  version: '0.0.0',
  frameworks: ['react'],
  source,
  dependencies: ['@magic-scope/tokens'],
  files: [`${Name}.tsx`, `${Name}.css`, 'index.ts'],
};

writeFileSync(join(dir, `${Name}.tsx`), tsx);
writeFileSync(join(dir, `${Name}.css`), css);
writeFileSync(join(dir, 'component.json'), `${JSON.stringify(componentJson, null, 2)}\n`);
writeFileSync(join(dir, 'index.ts'), `export * from './${Name}';\n`);

appendFileSync(join(REACT_SRC, 'components', 'index.ts'), `export * from './${Name}';\n`);
appendFileSync(
  join(REACT_SRC, 'styles.css'),
  `@import './components/${Name}/${Name}.css' layer(ms.components);\n`,
);

console.log(
  `✓ 已生成组件 ${Name}(${category}, source.type=${sourceType}) → packages/react/src/components/${Name}/`,
);
console.log('  下一步:实现组件、补全 component.json 的 description / source,运行 pnpm registry');
if (sourceType !== 'original') {
  console.log(
    '  ⚠ inspired / captured 需真实溯源证据:把 source.app 换成真实来源(或加 url / screenshot),否则 pnpm registry 校验失败',
  );
}
