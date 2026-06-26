import { Skeleton } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <Skeleton variant="circle" style={{ inlineSize: '3.5rem', blockSize: '3.5rem' }} />
      <Skeleton variant="rect" style={{ inlineSize: '10rem', blockSize: '4rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton variant="text" style={{ inlineSize: '12rem' }} />
        <Skeleton variant="text" style={{ inlineSize: '9rem' }} />
      </div>
    </div>
  );
}
