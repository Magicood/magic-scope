import { Button, Progress } from '@magic-scope/react';
import { useEffect, useRef, useState } from 'react';

export default function Demo() {
  const [value, setValue] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current);
    };
  }, []);

  const run = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    setValue(0);
    timer.current = window.setInterval(() => {
      setValue((prev) => {
        const next = prev + 4;
        if (next >= 100) {
          if (timer.current !== null) window.clearInterval(timer.current);
          timer.current = null;
          return 100;
        }
        return next;
      });
    }, 80);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', inlineSize: '100%' }}>
      <Progress value={value} aria-label={`加载 ${Math.round(value)}%`} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button size="sm" variant="outline" onClick={run}>
          自动跑一遍
        </Button>
        <span style={{ fontSize: '0.8125rem', color: 'var(--ms-color-fg-muted)' }}>
          {Math.round(value)}%
        </span>
      </div>
    </div>
  );
}
