import { ScrollArea } from '@magic-scope/react';

// 双向溢出:orientation=both,一张超尺寸网格,纵横两条自绘滚动条协同。
const rows = Array.from({ length: 14 }, (_, r) => r);
const cols = Array.from({ length: 8 }, (_, c) => c);

export default function Demo() {
  return (
    <ScrollArea
      orientation="both"
      style={{
        blockSize: '200px',
        inlineSize: 'min(380px, 100%)',
        border: '1px solid var(--ms-color-border)',
        borderRadius: 'var(--ms-radius-md)',
      }}
    >
      <table style={{ borderCollapse: 'collapse', color: 'var(--ms-color-fg-muted)' }}>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              {cols.map((c) => (
                <td
                  key={c}
                  style={{
                    padding: '0.5rem 0.9rem',
                    border: '1px solid var(--ms-color-border)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  R{r + 1}·C{c + 1}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
}
