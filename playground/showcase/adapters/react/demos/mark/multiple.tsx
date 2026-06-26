import { Mark } from '@magic-scope/react';

// 多词高亮:search 传字符串数组,各词独立全局匹配后做区间并集。
// 相邻 / 重叠的命中会被合并(不产生嵌套包裹),内部重复词去重,匹配顺序与书写顺序无关。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.8rem', maxInlineSize: 'min(520px, 100%)' }}>
      <p style={{ lineHeight: 1.9, margin: 0 }}>
        <Mark search={['React', 'Vue', 'Angular']} tone="info">
          magic-scope 以 React 为基准落地,适配契约框架无关:后续接入 Vue、Angular 都对齐同一套语义。
        </Mark>
      </p>
      <p style={{ lineHeight: 1.9, margin: 0 }}>
        {/* 重叠命中合并:foo 与 oba 在 "foobar" 上区间相接,合并为一段、不嵌套 */}
        <Mark search={['foo', 'oba']} tone="accent">
          foobar 里 foo 与 oba 命中区间相接,合并成一段高亮、不嵌套包裹。
        </Mark>
      </p>
    </div>
  );
}
