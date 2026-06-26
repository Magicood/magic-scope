import { Badge } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(260px, 100%)' }}>
      <Badge tone="primary" variant="soft">
        supercalifragilisticexpialidocious-超长无空格的状态标签会被省略号收住
      </Badge>
      <Badge tone="danger" variant="solid">
        这是一段相当长的中文状态描述用来验证标签在受限宽度容器内被边界收住而不撑破布局
      </Badge>
      <Badge tone="accent" variant="outline">
        https://magic-scope.example.com/very/long/path/without/breaks?token=abcdef
      </Badge>
    </div>
  );
}
