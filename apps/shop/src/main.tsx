import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@magic-scope/react/styles.css';
import './styles/shop.css';
import './styles/admin.css';
import { App } from './App';
import { bootstrapAppearance } from './lib/appearance';

// 渲染前应用持久化的外观偏好(主题/明暗/密度/动效),避免首帧错样
const initialAppearance = bootstrapAppearance();

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App initialAppearance={initialAppearance} />
    </StrictMode>,
  );
}
