import { defineConfig } from 'vitepress';

export default defineConfig({
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
