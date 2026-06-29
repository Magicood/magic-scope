import { Button, toast } from '@magic-scope/react';

export default function Demo() {
  return <Button onClick={() => toast.success('已保存')}>保存更改</Button>;
}
