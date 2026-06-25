# 发布与 CI 运维

magic-scope 的两条 GitHub Actions 流水线,以及发布所需的一次性配置。

## 流水线

| 文件 | 触发 | 作用 |
| --- | --- | --- |
| `.github/workflows/ci.yml` | 每个 PR + push 到 `main` | 质量门禁:install → lint → build → typecheck → test → registry → `manifest.json` 已提交校验 → publint |
| `.github/workflows/release.yml` | push 到 `main` | 用 [changesets](https://github.com/changesets/changesets) 自动开「Version Packages」PR;该 PR 合并后自动发布到 npm |

## 日常发布流程(攒变更 → 自动发版)

1. **改动发布包时写 changeset**(组件会话也照此):`pnpm changeset` → 选包 + 写说明。
2. 把 changeset 随改动合并进 `main`。
3. `release.yml` 检测到有 changeset,自动开/更新一个 **「Version Packages」PR**(里面已 bump semver + 生成 CHANGELOG)。
4. **想发版时合并那个 PR**。合并后 `release.yml` 再次运行,检测到无待消费 changeset,执行 `pnpm release`(`pnpm build && changeset publish`)发布到 npm 并打 tag。

> 攒多少、何时发,由「是否合并 Version PR」这一个动作控制。不合并就一直攒着。

## 一次性配置(发布鉴权,二选一)

`release.yml` 的发布步骤需要鉴权,二选一:

### A) Trusted Publishing(推荐,免 token)

npm 2025 起支持用 GitHub OIDC 免 token 发布,无明文凭证、最安全。

1. 登录 npmjs.com → 分别进入 `@magic-scope/tokens`、`@magic-scope/react` 的 **Settings → Trusted Publishing**。
2. 各加一个 **GitHub Actions** publisher:
   - Repository:`Magicood/magic-scope`
   - Workflow filename:`release.yml`
3. 完成。`release.yml` 里已有 `permissions: id-token: write`,无需任何 secret。

> 注意:发布走 `changeset publish` → 底层 `pnpm publish`。pnpm 对 OIDC trusted publishing 的支持随版本演进,**首次发版请盯一眼 Actions 日志确认 publish 成功**;若 OIDC 不通,改用方案 B。

### B) Automation Token(回退,简单可靠)

1. npmjs.com → Access Tokens → 生成 **Granular** token:Read and write + 勾 **Bypass 2FA** + scope `@magic-scope`。
2. GitHub repo → Settings → Secrets and variables → Actions → 新增 `NPM_TOKEN` = 该 token。
3. 在 `release.yml` 取消 `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` 一行的注释。

> token 是明文凭证;放进 repo secret 后,本机 `~/.npmrc` 不必再留 token。

## provenance(供应链溯源)

`npm publish --provenance` 能给包附上「由哪个 commit、哪条 workflow 构建」的可验证证明,但**要求仓库 public**。本仓库当前 private,故 `release.yml` 里 `NPM_CONFIG_PROVENANCE` 暂注释。仓库转 public 后取消注释即可启用。

## 本地发布质量自检(对应 CI 的 publint 门禁)

```bash
pnpm build
npx -y publint packages/tokens
npx -y publint packages/react
# 类型导出抽查(CSS 导出与 node10 子路径的 💀 为已知误报,忽略):
npx -y @arethetypeswrong/cli --pack packages/tokens
```

## 与「手动发布」的关系

CI 上线后,推荐一律走「合并 Version PR」自动发版。若需本机应急手动发布,参考已验证可行的姿势:`pnpm --filter <pkg> pack`(替换 `workspace:*`)→ `npm publish <tarball> --access public`(详见项目记忆 `magic-scope-publish-ops`)。
