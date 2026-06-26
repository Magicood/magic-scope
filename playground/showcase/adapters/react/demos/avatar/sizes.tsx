import { Avatar } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <Avatar size="sm" name="Sm" />
      <Avatar size="md" name="Md" />
      <Avatar size="lg" name="Lg" />
    </div>
  );
}
