import { presetThemes, registerProperties, registerThemes } from '@magic-scope/tokens';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../packages/react/src/styles.css';
import { App } from './App';
import { applyInitialPrefs } from './core/themeState';
import './showcase.css';

// 注册预设主题(供顶栏 / 预设画廊切换)与可补间 @property,再按持久化偏好落地(无闪烁恢复)。
registerThemes(presetThemes);
registerProperties();
applyInitialPrefs();
document.body.style.background = 'var(--ms-color-bg)';
document.body.style.minHeight = '100vh';
document.body.style.margin = '0';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
