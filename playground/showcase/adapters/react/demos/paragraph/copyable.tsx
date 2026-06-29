import { Paragraph } from '@magic-scope/react';
import { useState } from 'react';

// 一键复制 copyable:true 复制段落自身可见文本;对象 { text, onCopy } 自定义文本与成功回调。
// 复制成功瞬间触发 glow 光晕一闪(受全局光影开关 / reduced-motion 调制),按钮文案走 i18n。
const COMMAND = 'npm install @magic-scope/react';

export default function Demo() {
  const [lastCopied, setLastCopied] = useState<string | null>(null);

  return (
    <div style={{ display: 'grid', gap: '1.1rem', maxInlineSize: 'min(520px, 100%)' }}>
      {/* 复制段落自身可见文本(true 速记) */}
      <Paragraph copyable>悬停段落右侧出现复制按钮,点击即可复制这一整段可见文本。</Paragraph>

      {/* 自定义要复制的文本 + 成功回调 */}
      <Paragraph tone="accent" copyable={{ text: COMMAND, onCopy: setLastCopied }}>
        点这段会复制安装命令:<code>{COMMAND}</code>
      </Paragraph>

      {lastCopied && (
        <Paragraph size="xs" dimmed>
          已复制到剪贴板:{lastCopied}
        </Paragraph>
      )}
    </div>
  );
}
