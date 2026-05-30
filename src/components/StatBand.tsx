import { useEffect, useRef, useState } from 'react';
import type { StatTile } from '../types';

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setShown(true);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    const fallback = setTimeout(() => setShown(true), 500);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);
  return { ref, shown };
}

function CountUp({ to, suffix, shown }: { to: number; suffix?: string; shown: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!shown) return;
    let raf = 0;
    let start = 0;
    const dur = 750;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, to]);
  return (
    <>
      {n.toLocaleString()}
      {suffix ?? ''}
    </>
  );
}

export default function StatBand({ stats }: { stats: StatTile[] }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  if (!stats || stats.length === 0) return null;
  return (
    <div
      ref={ref}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
      style={{ gridAutoRows: '1fr' }}
    >
      {stats.map((s, i) => {
        const accent = s.accent || 'var(--dbt)';
        return (
          <div
            key={i}
            className="panel-elev p-4 flex flex-col justify-between"
            style={{ borderTop: `3px solid ${accent}` }}
          >
            <div
              className="font-display leading-none"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: accent }}
            >
              {typeof s.count === 'number' ? (
                <CountUp to={s.count} suffix={s.suffix} shown={shown} />
              ) : (
                s.value
              )}
            </div>
            <div className="mt-2">
              <div className="eyebrow" style={{ color: 'var(--text)' }}>
                {s.label}
              </div>
              {s.sub ? (
                <div className="text-xs mt-1 leading-snug" style={{ color: 'var(--text-soft)' }}>
                  {s.sub}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
