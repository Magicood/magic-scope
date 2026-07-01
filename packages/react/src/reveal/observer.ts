/**
 * 单例 IntersectionObserver 池 —— 按 `${margin}|${amount}` 分桶复用,
 * 同参数共享一个 observer,全站理想 1–3 个实例。Map<Element,记录> 分发。
 * SSR / 不支持时立即回调 inView=true,内容必可见,绝不卡在隐藏初态。
 */

type RevealCallback = (inView: boolean) => void;

interface Bucket {
  io: IntersectionObserver;
  records: Map<Element, { cb: RevealCallback; once: boolean }>;
}

export interface ObserveOptions {
  /** IntersectionObserver threshold(0–1),默认 0.2。 */
  amount?: number | undefined;
  /** IntersectionObserver rootMargin,默认 '0px 0px -10% 0px'(略提前触发)。 */
  margin?: string | undefined;
  /** 命中一次即停止观察(默认 true);false 时进出视口反复回调。 */
  once?: boolean | undefined;
}

const SUPPORTED = typeof IntersectionObserver !== 'undefined';
const pool = new Map<string, Bucket>();

/** 观察元素;返回取消订阅函数。 */
export function observe(el: Element, cb: RevealCallback, opts: ObserveOptions = {}): () => void {
  if (!SUPPORTED) {
    cb(true);
    return () => {};
  }
  const { amount = 0.2, margin = '0px 0px -10% 0px', once = true } = opts;
  const key = `${margin}|${amount}`;

  let bucket = pool.get(key);
  if (!bucket) {
    const records = new Map<Element, { cb: RevealCallback; once: boolean }>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const rec = records.get(entry.target);
          if (!rec) continue;
          if (entry.isIntersecting) {
            rec.cb(true);
            if (rec.once) {
              records.delete(entry.target);
              io.unobserve(entry.target);
            }
          } else if (!rec.once) {
            rec.cb(false);
          }
        }
        if (records.size === 0) {
          io.disconnect();
          pool.delete(key);
        }
      },
      { threshold: amount, rootMargin: margin },
    );
    bucket = { io, records };
    pool.set(key, bucket);
  }

  bucket.records.set(el, { cb, once });
  bucket.io.observe(el);

  return () => {
    const b = pool.get(key);
    if (!b) return;
    b.records.delete(el);
    b.io.unobserve(el);
    if (b.records.size === 0) {
      b.io.disconnect();
      pool.delete(key);
    }
  };
}
