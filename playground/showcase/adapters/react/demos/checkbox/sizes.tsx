import { Checkbox } from '@magic-scope/react';

/**
 * size 三档(sm / md / lg)缩放方块、文字与命中区,随密度 data-ms-density 联动。
 * 搭配 description 次级说明(fg-muted),把补充语境挂在标签下方,
 * 经显式 aria-labelledby / aria-describedby 收窄可访问名,说明只作 describedby。
 */
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.9rem' }}>
      <Checkbox size="sm" defaultChecked description="紧凑场景,如表格行内多选。">
        小号 sm
      </Checkbox>
      <Checkbox size="md" defaultChecked description="默认尺寸,适配大多数表单。">
        中号 md
      </Checkbox>
      <Checkbox size="lg" defaultChecked description="触控优先,命中区更大。">
        大号 lg
      </Checkbox>
    </div>
  );
}
