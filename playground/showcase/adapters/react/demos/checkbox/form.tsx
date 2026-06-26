import { Checkbox } from '@magic-scope/react';

/**
 * 透传原生 input 属性:name / value / required / 默认表单提交都来自原生。
 * 直接放进 <form>,无需额外受控代码即可参与表单收集。
 */
export default function Demo() {
  return (
    <form style={{ display: 'grid', gap: '0.6rem' }} onSubmit={(e) => e.preventDefault()}>
      <Checkbox name="scope" value="arcane" defaultChecked>
        奥术学派
      </Checkbox>
      <Checkbox name="scope" value="divine">
        神圣学派
      </Checkbox>
      <Checkbox name="agree" required>
        我已阅读并同意契约条款(required)
      </Checkbox>
    </form>
  );
}
