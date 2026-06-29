import { Switch } from '@magic-scope/react';

const longWord =
  '用于压力测试的超长连续标识符WithoutAnySpacesToProveWrappingAndOverflowAreContained始终约束在轨道之外不撑破布局';
const longText =
  '这是一段用于压力测试的超长说明正文,会持续延伸以模拟真实业务里偶尔出现的冗长设置项描述,并在每一帧重算辉光强度、滑块位移与焦点环半径,以确保在任意视口宽度下开关本体始终保持紧凑,而承载的说明文案自然换行、不裁剪焦点环、不挤压控件命中区。';

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        inlineSize: 'min(360px, 100%)',
        padding: '0.75rem',
        border: '1px solid var(--ms-color-border)',
        borderRadius: 'var(--ms-radius-md)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Switch defaultChecked aria-label="超长无空格标识符标签" />
        <span
          style={{
            color: 'var(--ms-color-fg-muted)',
            minInlineSize: 0,
            overflowWrap: 'anywhere',
          }}
        >
          {longWord}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
        <Switch defaultChecked aria-label="巨量正文标签" style={{ flex: 'none' }} />
        <span style={{ color: 'var(--ms-color-fg-muted)', minInlineSize: 0 }}>{longText}</span>
      </div>
    </div>
  );
}
