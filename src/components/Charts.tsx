import { useEffect, useRef, useState } from 'react';
import type { ChartSpec, ChartDatum, CompareItem } from '../types';

// Trigger the grow animation once the chart scrolls into view.
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
      { threshold: 0.25 },
    );
    io.observe(el);
    // Safety net: reveal even if the observer never fires (layout/visibility edge cases).
    const fallback = setTimeout(() => setShown(true), 500);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);
  return { ref, shown };
}

function ChartFrame({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel p-5">
      <div className="font-display text-base" style={{ color: 'var(--text)' }}>
        {title}
      </div>
      {note ? (
        <div className="mt-1 text-xs" style={{ color: 'var(--text-soft)' }}>
          {note}
        </div>
      ) : null}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function BarChart({
  data,
  unit,
}: {
  data: ChartDatum[];
  unit?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div ref={ref}>
      <div
        className="flex items-end gap-3"
        style={{ height: 200 }}
      >
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          const color = d.color || 'var(--dbt)';
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
              <div
                className="font-mono text-xs mb-1"
                style={{ color: 'var(--text)' }}
              >
                {d.display ?? d.value}
              </div>
              <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 54,
                    height: shown ? `${pct}%` : '0%',
                    background: color,
                    borderRadius: '4px 4px 0 0',
                    transition: `height 700ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 80}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-2">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 text-center text-[11px] leading-tight min-w-0"
            style={{ color: 'var(--text-muted)', overflowWrap: 'anywhere' }}
          >
            {d.label}
          </div>
        ))}
      </div>
      {unit ? (
        <div className="eyebrow mt-3 text-center" style={{ color: 'var(--text-soft)' }}>
          {unit}
        </div>
      ) : null}
    </div>
  );
}

function CompareBars({
  items,
  legendA = 'Without dbt Wizard',
  legendB = 'With dbt Wizard',
}: {
  items: CompareItem[];
  legendA?: string;
  legendB?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const max = Math.max(...items.flatMap((it) => [it.before, it.after]), 1);
  return (
    <div ref={ref} className="flex flex-col gap-5">
      <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        <span className="inline-flex items-center gap-1.5">
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--text-soft)', display: 'inline-block' }} />
          {legendA}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--dbt)', display: 'inline-block' }} />
          {legendB}
        </span>
      </div>
      {items.map((it, i) => (
        <div key={i}>
          <div className="text-sm mb-2" style={{ color: 'var(--text)' }}>
            {it.label}
          </div>
          <div className="flex flex-col gap-1.5">
            <Row
              pct={(it.before / max) * 100}
              shown={shown}
              delay={i * 90}
              color="var(--text-soft)"
              label={it.beforeLabel}
            />
            <Row
              pct={(it.after / max) * 100}
              shown={shown}
              delay={i * 90 + 120}
              color="var(--dbt)"
              label={it.afterLabel}
              glow
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Row({
  pct,
  shown,
  delay,
  color,
  label,
  glow,
}: {
  pct: number;
  shown: boolean;
  delay: number;
  color: string;
  label?: string;
  glow?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3.5 rounded-full" style={{ background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: shown ? `${Math.max(pct, 2)}%` : '0%',
            background: color,
            borderRadius: 999,
            transition: `width 750ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
            boxShadow: glow ? '0 0 12px var(--dbt-glow)' : 'none',
          }}
        />
      </div>
      {label ? (
        <div className="font-mono text-xs whitespace-nowrap" style={{ color: glow ? 'var(--dbt-bright)' : 'var(--text-soft)', minWidth: 96, textAlign: 'right' }}>
          {label}
        </div>
      ) : null}
    </div>
  );
}

export function Chart({ spec }: { spec: ChartSpec }) {
  return (
    <ChartFrame title={spec.title} note={spec.note}>
      {spec.kind === 'compare' ? (
        spec.items ? (
          <CompareBars items={spec.items} legendA={spec.legendA} legendB={spec.legendB} />
        ) : null
      ) : spec.data ? (
        <BarChart data={spec.data} unit={spec.unit} />
      ) : null}
    </ChartFrame>
  );
}

export default function Charts({ specs }: { specs: ChartSpec[] }) {
  if (!specs || specs.length === 0) return null;
  return (
    <div className="grid gap-4">
      {specs.map((s, i) => (
        <Chart key={i} spec={s} />
      ))}
    </div>
  );
}
