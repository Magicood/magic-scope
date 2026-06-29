import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyTheme, arcaneDark, registerProperties } from '../packages/tokens/src/index';
import '../packages/react/src/styles.css';
import { App } from './App';

// 应用默认主题(深色)并注册可补间 @property。
applyTheme(arcaneDark);
registerProperties();
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
