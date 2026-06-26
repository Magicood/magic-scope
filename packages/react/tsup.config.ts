import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/styles.css'],
  format: ['esm', 'cjs'],
  dts: { entry: 'src/index.ts' },
  clean: true,
  // 同 tokens:不随包发布 sourcemap(瘦身 + 干净 dist),dev 走 src。
  sourcemap: false,
  treeshake: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  // 构建后:把本包组件的 component.json 溯源汇总成 dist/registry.json 随包发布,
  // 让「可追溯」从 git 仓库延伸到消费端(读 @magic-scope/react/registry.json)。
  async onSuccess() {
    const dir = join('src', 'components');
    const manifest = readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => join(dir, e.name, 'component.json'))
      .filter((p) => existsSync(p))
      .map((p) => JSON.parse(readFileSync(p, 'utf8')))
      .sort((a, b) => a.id.localeCompare(b.id));
    writeFileSync(join('dist', 'registry.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`  ✓ dist/registry.json(${manifest.length} 个组件溯源)`);
  },
});
