import { applyTheme, registerProperties, registerThemes } from '@magic-scope/tokens';
import { presetThemes, solarLight } from '@magic-scope/tokens/themes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@magic-scope/react/styles.css';
import { App } from './App';
import { applyBrandPalette } from './lib/palette';
import './styles/app.css';

// 主题引导:以「曦光浅色」打底,再覆盖一层 Daybreak 自定义的高级编辑式调色板。
registerThemes(presetThemes);
registerProperties();
applyTheme(solarLight);
applyBrandPalette();

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
