import {
  applyTheme,
  arcaneDark,
  presetThemes,
  registerProperties,
  registerThemes,
} from '@magic-scope/tokens';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../packages/react/src/styles.css';
import { App } from './App';
import './showcase.css';

// 注册预设主题(供顶栏 / 预设画廊切换),应用默认深色奥术,注册可补间 @property。
registerThemes(presetThemes);
applyTheme(arcaneDark);
registerProperties();
// 默认光影克制一档。
document.documentElement.dataset.msFx = 'subtle';
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
