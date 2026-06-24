/**
 * 建索引:扫描 packages/*\/src/**\/component.json → 用 componentSchema 校验 → 写 registry/manifest.json。
 * files 为唯一真相源,manifest.json 为生成物(供文档站 / 前台查询)。
 *
 * 骨架占位:当前无组件,生成空 manifest。glob 扫描与校验待实现。
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

// TODO: 用 fast-glob 扫描 component.json,逐个 componentSchema.parse 校验后汇总
const manifest: unknown[] = [];

const out = join(import.meta.dirname, 'manifest.json');
writeFileSync(out, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`registry: 写入 ${manifest.length} 个组件 → ${out}`);
