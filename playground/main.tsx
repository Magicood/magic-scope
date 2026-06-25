import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  applyTheme,
  arcaneDark,
  presetThemes,
  registerProperties,
  registerThemes,
} from '../packages/tokens/src/index';
import '../packages/react/src/styles.css';
import './showcase.css';
import { App } from './App';

// 注册预设主题(供顶栏 setTheme 切换),应用默认深色奥术,注册可补间 @property。
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
