import { Button, Spinner } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [loading, setLoading] = useState(false);

  function submit() {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  }

  return (
    <Button onClick={submit} disabled={loading}>
      <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
        {loading && <Spinner size="sm" label="保存中" style={{ filter: 'none' }} />}
        {loading ? '保存中…' : '保存更改'}
      </span>
    </Button>
  );
}
