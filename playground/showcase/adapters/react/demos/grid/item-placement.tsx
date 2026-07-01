import { Grid } from '@magic-scope/react';
import type { CSSProperties } from 'react';

const cell: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  minBlockSize: '2.5rem',
  paddingInline: '0.5rem',
  borderRadius: 'var(--ms-radius-md)',
  border: '1px solid var(--ms-color-border)',
  background: 'var(--ms-color-surface-raised, rgba(127, 127, 127, 0.12))',
  color: 'var(--ms-color-fg-muted)',
  fontSize: '0.8rem',
  textAlign: 'center',
};

// Grid.Item 自身定位:rowStart 指定起始行线、alignSelf / justifySelf 覆盖父级 align / justify。
export default function Demo() {
  return (
    <Grid
      columns={3}
      gap={3}
      autoRows="3.5rem"
      style={{ inlineSize: 'min(420px, 100%)', minBlockSize: '8rem' }}
    >
      <Grid.Item rowStart={1} rowSpan={2}>
        <div style={{ ...cell, blockSize: '100%' }}>rowStart=1 · rowSpan=2</div>
      </Grid.Item>
      <Grid.Item alignSelf="end">
        <div style={cell}>alignSelf=end</div>
      </Grid.Item>
      <Grid.Item justifySelf="center">
        <div style={{ ...cell, inlineSize: '4.5rem' }}>justifySelf=center</div>
      </Grid.Item>
    </Grid>
  );
}
