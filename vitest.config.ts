import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // 排除 Claude Code agent 临时 worktree(仓库内副本),避免重复跑别的会话的测试
    exclude: [...configDefaults.exclude, '**/.claude/worktrees/**'],
  },
});
