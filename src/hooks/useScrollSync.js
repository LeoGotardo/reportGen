import { useEffect } from "react";

/**
 * Sincroniza proporcionalmente o scroll de dois elementos.
 * O elemento que recebe a interação vira "dono" do scroll até o próximo frame,
 * evitando loop de feedback entre os dois listeners.
 */
export function useScrollSync(refA, refB, enabled = true) {
  useEffect(() => {
    const a = refA.current;
    const b = refB.current;
    if (!enabled || !a || !b) return;

    let owner = null;
    let raf = 0;

    const range = el => Math.max(1, el.scrollHeight - el.clientHeight);

    const makeHandler = (src, dst) => () => {
      if (owner && owner !== src) return;
      owner = src;
      cancelAnimationFrame(raf);
      dst.scrollTop = (src.scrollTop / range(src)) * range(dst);
      raf = requestAnimationFrame(() => { owner = null; });
    };

    const onA = makeHandler(a, b);
    const onB = makeHandler(b, a);

    a.addEventListener("scroll", onA, { passive: true });
    b.addEventListener("scroll", onB, { passive: true });

    return () => {
      a.removeEventListener("scroll", onA);
      b.removeEventListener("scroll", onB);
      cancelAnimationFrame(raf);
    };
  }, [refA, refB, enabled]);
}
