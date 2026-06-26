import { Button, toast } from '@magic-scope/react';

export default function Demo() {
  return <Button onClick={() => toast.success('施法成功 ✦')}>施法 ✦</Button>;
}
