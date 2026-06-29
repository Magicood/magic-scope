import { Accordion } from '@magic-scope/react';

// single:同时只展开一项,展开新项时自动收起其余项。
export default function Demo() {
  return (
    <Accordion
      type="single"
      defaultValue="account"
      items={[
        {
          value: 'account',
          title: '如何修改账户邮箱?',
          content: '在「设置 → 账户」中更新邮箱,保存后会向新地址发送一封验证邮件。',
        },
        {
          value: 'billing',
          title: '在哪里查看账单与发票?',
          content: '「设置 → 计费」可查看当前套餐、历史账单,并随时下载 PDF 发票。',
        },
        {
          value: 'cancel',
          title: '如何取消订阅?',
          content: '在计费页面点击「取消订阅」,当前计费周期结束前仍可继续使用。',
        },
      ]}
    />
  );
}
