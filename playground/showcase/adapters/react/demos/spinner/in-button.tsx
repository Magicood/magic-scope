import { Button, Spinner } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [loading, setLoading] = useState(false);

  function cast() {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  }

  return (
    <Button onClick={cast} disabled={loading}>
      <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
        {loading && <Spinner size="sm" label="施法中" style={{ filter: 'none' }} />}
        {loading ? '施法中…' : '开始施法 ✦'}
      </span>
    </Button>
  );
}
