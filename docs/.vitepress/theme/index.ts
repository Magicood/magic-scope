import DefaultTheme from 'vitepress/theme';
import { onMounted } from 'vue';
import '../../../packages/react/src/styles.css';
import './tokens.css';
import './demo.css';

/** 注入一个固定的「效果开关」面板,演示 data-ms-fx / data-ms-motion 全局联动。 */
function injectFxControls(): void {
  if (document.getElementById('ms-fx-controls')) return;
  const root = document.documentElement;
  const el = document.createElement('div');
  el.id = 'ms-fx-controls';
  el.setAttribute(
    'style',
    [
      'position:fixed',
      'right:16px',
      'bottom:16px',
      'z-index:99',
      'display:flex',
      'flex-direction:column',
      'gap:6px',
      'padding:10px 12px',
      'border-radius:10px',
      'background:#1c1828',
      'border:1px solid #2e2842',
      'color:#f2eefb',
      'font:12px/1.5 system-ui,sans-serif',
      'box-shadow:0 8px 30px -10px rgba(0,0,0,.6)',
    ].join(';'),
  );
  const btn =
    'style="margin-inline:2px;padding:1px 7px;border-radius:6px;border:1px solid #2e2842;background:#13101c;color:#c4b5fd;cursor:pointer"';
  el.innerHTML = `<strong style="color:#a78bfa">✦ 效果开关</strong>
    <div>光影 fx <button ${btn} data-fx="on">开</button><button ${btn} data-fx="off">关</button></div>
    <div>动效 motion <button ${btn} data-motion="full">全</button><button ${btn} data-motion="subtle">弱</button><button ${btn} data-motion="off">关</button></div>`;
  el.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLButtonElement)) return;
    if (t.dataset.fx) root.dataset.msFx = t.dataset.fx;
    if (t.dataset.motion) root.dataset.msMotion = t.dataset.motion;
  });
  document.body.appendChild(el);
}

export default {
  extends: DefaultTheme,
  setup() {
    onMounted(injectFxControls);
  },
};
