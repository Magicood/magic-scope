import { Radio, RadioGroup } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [tab, setTab] = useState('activity');
  return (
    <RadioGroup value={tab} onValueChange={setTab} aria-label="页面分区">
      <Radio value="overview">Overview 概览</Radio>
      <Radio value="activity">Activity 活动</Radio>
      <Radio value="members">Members 成员</Radio>
      <Radio value="billing" disabled>
        Billing 计费(单项禁用)
      </Radio>
    </RadioGroup>
  );
}
