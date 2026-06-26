import { Checkbox } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      <Checkbox defaultChecked>已勾选</Checkbox>
      <Checkbox>未勾选</Checkbox>
      <Checkbox indeterminate>半选(部分选中)</Checkbox>
      <Checkbox defaultChecked disabled>
        禁用(勾选)
      </Checkbox>
      <Checkbox disabled>禁用(未勾选)</Checkbox>
      <Checkbox defaultChecked aria-label="无标签复选框" />
    </div>
  );
}
