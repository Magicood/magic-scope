import { Input, Label } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <Label htmlFor="ms-label-required" required>
          真名
        </Label>
        <Input id="ms-label-required" placeholder="必填" aria-required />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <Label htmlFor="ms-label-optional">门派(可选)</Label>
        <Input id="ms-label-optional" placeholder="可选" />
      </div>
    </div>
  );
}
