import { Button, Input, toast } from '@magic-scope/react';
import { type FormEvent, useState } from 'react';
import { Reveal } from '../components/Reveal';

export function Newsletter() {
  const [email, setEmail] = useState<string>('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim() === '') {
      toast.error('请填写邮箱');
      return;
    }
    toast.success('已订阅,感谢你的信任');
    setEmail('');
  };

  return (
    <section className="db-section db-container">
      <Reveal>
        <div
          className="db-card"
          style={{
            maxInlineSize: '46rem',
            marginInline: 'auto',
            alignItems: 'center',
            textAlign: 'center',
            padding: 'clamp(2rem, 5vw, 3.5rem)',
            background:
              'linear-gradient(180deg, color-mix(in oklab, var(--ms-color-primary) 5%, var(--ms-color-surface)) 0%, var(--ms-color-surface) 100%)',
          }}
        >
          <p className="db-eyebrow" style={{ marginBlockEnd: 'var(--ms-space-3, 0.75rem)' }}>
            保持联系
          </p>

          <h2
            className="db-display"
            style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.25rem)', maxInlineSize: '24ch' }}
          >
            新豆上架,第一时间告诉你
          </h2>

          <p
            style={{
              marginBlockStart: 'var(--ms-space-3, 0.85rem)',
              maxInlineSize: '34rem',
              color: 'var(--ms-color-fg-muted)',
              fontSize: 'clamp(1rem, 1.5vw, 1.075rem)',
              lineHeight: 'var(--ms-leading-relaxed, 1.7)',
            }}
          >
            偶尔来信:当季产区、限量微批次与冲煮小技巧。
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--ms-space-3, 0.75rem)',
              justifyContent: 'center',
              inlineSize: '100%',
              maxInlineSize: '30rem',
              marginBlockStart: 'var(--ms-space-6, 1.75rem)',
            }}
          >
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="你的邮箱地址"
              aria-label="邮箱地址"
              size="lg"
              clearable
              onClear={() => setEmail('')}
              style={{ flex: '1 1 16rem', minInlineSize: '0' }}
            />
            <Button type="submit" size="lg" style={{ flex: '0 0 auto' }}>
              订阅
            </Button>
          </form>

          <p
            style={{
              marginBlockStart: 'var(--ms-space-4, 1rem)',
              color: 'var(--ms-color-fg-subtle)',
              fontSize: '0.82rem',
            }}
          >
            我们不会发送垃圾邮件,可随时退订。
          </p>
        </div>
      </Reveal>
    </section>
  );
}
