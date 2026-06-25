import { Divider } from '@magic-scope/react';

// 对抗性:把分隔线放进塞满超长无空格串与巨量正文的窄容器,
// 验证分隔线照常横跨/贴满,既不被内容撑破、也不被挤没。
export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(22rem, 100%)', color: 'var(--ms-color-fg-muted)' }}>
      <p style={{ marginBlockStart: 0, overflowWrap: 'anywhere' }}>
        超长无空格串:奥术飞弹符文链路阿瓦达索命传送门坐标超长串
        AbracadabraAlohomoraExpelliarmusWingardiumLeviosaAvadaKedavra1234567890
      </p>
      <Divider />
      <p style={{ overflowWrap: 'anywhere' }}>
        巨量正文:法师在风暴之巅持续吟诵咒语,每一个音节都牵动着位面之间的丝线,长篇累牍的禁咒不断堆叠在魔典的边缘,文字几乎要溢出页面的边界,而分隔线仍稳稳地横跨整个容器,把上下两段隔得清清楚楚。
      </p>
      <Divider />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          blockSize: '2.5rem',
        }}
      >
        <span style={{ overflowWrap: 'anywhere', minInlineSize: 0 }}>
          行内极限WingardiumLeviosaAvadaKedavra
        </span>
        <Divider orientation="vertical" />
        <span>尾项</span>
      </div>
    </div>
  );
}
