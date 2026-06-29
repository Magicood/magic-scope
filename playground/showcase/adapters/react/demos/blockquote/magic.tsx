import { Blockquote } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem', maxInlineSize: 'min(560px, 100%)' }}>
      {/* 渐变强调条:tone → glow 的渐变(受顶栏「光影」开关控制) */}
      <Blockquote tone="primary" gradient quoteMark>
        渐变强调条让引用从底色里「亮」起来,而不只是被框住。
      </Blockquote>

      {/* 光晕 glow:soft / strong 两档,受全局 --ms-fx-glow 调制 */}
      <Blockquote variant="filled" tone="accent" glow="soft" quoteMark>
        soft 光晕:柔和的光晕,克制而不喧宾夺主。
      </Blockquote>
      <Blockquote variant="filled" tone="danger" glow="strong" quoteMark>
        strong 光晕:危险色调下更强的光压,用于警示型引述。
      </Blockquote>

      {/* accentSide=end:强调条/缩进改到末端(逻辑值,RTL 友好) */}
      <Blockquote tone="success" accentSide="end" cite="对齐校验通过">
        强调条也可以落在末端 —— 逻辑属性,自动适配书写方向。
      </Blockquote>
    </div>
  );
}
