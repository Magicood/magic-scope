import { defineConfig } from 'vitepress';
// 侧栏由 pnpm gen:docs 从展示站 meta + manifest 生成(docs 真相源化,勿手改)。
import sidebar from './sidebar.generated.json';

export default defineConfig({
  // Pages 部署在子路径(如 /magic-scope/docs/)下时由 CI 注入;本地 dev 保持 '/'
  base: process.env.DOCS_BASE ?? '/',
  title: 'magic-scope',
  description: '多框架 UI 组件库 · 主题:魔法',
  // previews/ 是被组件页 @include 的手写预览部件,不单独成页。
  srcExclude: ['previews/**'],
  themeConfig: {
    nav: [
      { text: '组件', link: '/' },
      { text: '多端适配', link: '/responsive' },
      { text: '展示站', link: 'https://magicood.github.io/magic-scope/' },
    ],
    sidebar,
    socialLinks: [],
  },
});
