import { Checkbox } from '@magic-scope/react';

/**
 * 对抗性内容:超长无空格串 + 巨量正文。
 * 验证标签在窄容器内换行收住、方块固定不被撑变形、focus-visible 发光环不被裁。
 */
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.8rem', inlineSize: 'min(280px, 90vw)' }}>
      <Checkbox defaultChecked>
        启用超长无空格标识符ULTRA_LONG_FEATURE_FLAG_SUBSYSTEM_WITH_NO_BREAK_OPPORTUNITY_0123456789
      </Checkbox>
      <Checkbox>
        我已逐字阅读并完全理解这份冗长到不近人情的服务协议全文,包括其中关于数据处理、账单结算、责任限制以及在多个司法辖区同时生效的连带条款的所有附则与脚注,且自愿承担由此衍生的一切后果。
      </Checkbox>
    </div>
  );
}
