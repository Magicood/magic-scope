import { applyTheme, registerProperties, registerThemes } from '@magic-scope/tokens';
import { arcaneDark, presetThemes } from '@magic-scope/tokens/themes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@magic-scope/react/styles.css';
import { App } from './App';
import './styles/app.css';

// 主题引导:注册所有预设(供运行时换肤)、注册可补间的 @property、应用默认深色主题。
registerThemes(presetThemes);
registerProperties();
applyTheme(arcaneDark);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
