import { Progress } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', inlineSize: '100%' }}>
      <Progress value={25} aria-label="进度 25%" />
      <Progress value={50} aria-label="进度 50%" />
      <Progress value={75} aria-label="进度 75%" />
      <Progress value={100} aria-label="进度 100%" />
    </div>
  );
}
