import { applyTheme, registerProperties, registerThemes } from '@magic-scope/tokens';
import { presetThemes, solarLight } from '@magic-scope/tokens/themes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@magic-scope/react/styles.css';
import { App } from './App';
import './styles/app.css';

// 主题引导:注册全部预设(供运行时换肤),应用「曦光浅色」做暖色零售默认基调。
registerThemes(presetThemes);
registerProperties();
applyTheme(solarLight);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
