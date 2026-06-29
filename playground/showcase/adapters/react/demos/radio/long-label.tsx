import { Radio, RadioGroup } from '@magic-scope/react';

// 对抗性内容:选项标签承载用户内容,塞超长无空格串与巨量文本,
// 验证标签随容器换行、不撑破布局、不裁掉聚焦发光环。
export default function Demo() {
  return (
    <RadioGroup
      defaultValue="normal"
      aria-label="超长标签"
      style={{ inlineSize: 'min(360px, 100%)' }}
    >
      <Radio value="normal">普通选项</Radio>
      <Radio value="url">
        超长无空格串:https://magic-scope.example.com/dashboard/projects/settings?ref=verylongtokenwithoutanyspaces1234567890
      </Radio>
      <Radio value="prose">
        巨量正文:这是一段用于压力测试的超长正文,会持续延伸以验证标签在受限宽度下的换行行为,直到内容铺满整行也不应撑破布局,这段标签会随容器宽度自然换行而不会撑破单选组的边界。
      </Radio>
    </RadioGroup>
  );
}
