import { defineConfig } from 'vitepress';

export default defineConfig({
  // Pages 部署在子路径(如 /magic-scope/docs/)下时由 CI 注入;本地 dev 保持 '/'
  base: process.env.DOCS_BASE ?? '/',
  title: 'magic-scope',
  description: '多框架 UI 组件库 · 主题:魔法',
  themeConfig: {
    nav: [
      { text: '组件', link: '/' },
      { text: '多端适配', link: '/responsive' },
    ],
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '组件总览', link: '/' },
          { text: '多端 / 设备适配', link: '/responsive' },
        ],
      },
    ],
    socialLinks: [],
  },
});
