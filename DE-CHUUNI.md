# 去中二文案规范

> 用户 2026-06 定的视觉方向(见 memory `magic-scope-visual-direction`):**"魔法" = 视觉效果,不是中二法术文字**。整体优雅简洁(Linear / Stripe 风),文案克制专业。
> 本文件是全库去中二的**对照规则**,各会话改自己领地时照此执行。tokens 层已清(PR #13)。

## 替换规则

| 中二词 | 换成 | 注意 |
|---|---|---|
| 奥术(发光 / 回路 / 提示 / 抽屉…) | 删修饰词或换中性词;`primary 奥术`→`primary 主色` | 最高频,通常是可删的修饰 |
| 施法 | `施法成功`→`操作成功`;demo `施法 ✦`→`按钮` / `确定` | |
| 咒语 | `写下你的咒语…`→`输入内容…` | placeholder |
| 符文 | `默认符文`→`默认图标` | Result 的 status icon 叫法 |
| 辉光 | `辉光 glow`(label)→`发光 glow` | **保留 prop 名 `glow`** |
| 流光 | `aurora 流光`→`aurora 渐变` | **保留 variant 值 `aurora`** |
| 召唤 / 结界 / 法术 / 魔咒 | 唤起 / 区域 / 流程… 按语境 | |

## 保留(改了会 breaking)

只改**面向用户的中文** label / 描述 / 默认文案 / 注释;以下英文标识符**留着不动**:

- `glow`(prop 名)、`aurora`(variant value)、`shimmer`(Skeleton 行业通用词)、主题 key `arcane`(family name)。

## 领地分工

| 会话 | 领地 | 改什么 | 验证 |
|---|---|---|---|
| 组件 | `packages/react/src/components/` | `component.json` 的 `description`、`*.tsx` 的 JSDoc / 注释 / 默认文案、`*.css` 注释 | `pnpm registry`(重生成 manifest)+ `pnpm lint && pnpm test` |
| 展示站 | `playground/` | `showcase/registry/*.meta.ts` 的 summary / description / label / default、`adapters/**/demos` 文案 | `pnpm check:showcase`(`generated/` 是产物,改源头别手改) |
| Vela | `apps/` | 站内文案 | 站点自检 |
| 架构 | `packages/tokens` | ✅ 已清(PR #13) | — |

## 自查命令

```bash
grep -rnE '奥术|施法|咒语|符文|辉光|流光|召唤|结界|法术|魔咒' <你的领地> \
  --include='*.ts' --include='*.tsx' --include='*.json' --include='*.css'
```

改完走 PR 合 main,动手前先建 worktree(见 memory `multi-session-worktree-rule`)。
