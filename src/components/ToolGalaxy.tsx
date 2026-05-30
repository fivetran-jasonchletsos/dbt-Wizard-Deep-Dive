import { useMemo, useState } from 'react';

// The 17 mcp__dbt_index__* tools, grouped by capability around a shared core.
// Hover a category to light its tools. Detail sourced from dbt Wizard.

interface Cat {
  name: string;
  color: string;
  tools: string[];
}

const CATS: Cat[] = [
  { name: 'DAG-aware', color: '#ff694b', tools: ['impact', 'lineage', 'timings'] },
  { name: 'Project index', color: '#4aa8ff', tools: ['status', 'search', 'describe', 'changeset'] },
  { name: 'Warehouse', color: '#00b4a0', tools: ['warehouse', 'dbt_show'] },
  { name: 'dbt-native', color: '#a78bfa', tools: ['dbt_build', 'dbt_run', 'dbt_compile', 'dbt_test', 'dbt_parse'] },
  { name: 'Context', color: '#f5a623', tools: ['context'] },
  { name: 'Metrics', color: '#30c48d', tools: ['metrics'] },
  { name: 'Diff', color: '#e879b8', tools: ['diff'] },
];

const W = 940;
const H = 580;
const CX = W / 2;
const CY = H / 2;
const RH = 152; // hub radius
const RT = 312; // tool radius
const DEG = Math.PI / 180;

interface Placed {
  ci: number;
  color: string;
  hub: { x: number; y: number; name: string };
  tools: { x: number; y: number; label: string }[];
}

function place(): Placed[] {
  return CATS.map((c, i) => {
    const a = (-90 + (i * 360) / CATS.length) * DEG;
    const hub = { x: CX + RH * Math.cos(a), y: CY + RH * Math.sin(a), name: c.name };
    const k = c.tools.length;
    const tools = c.tools.map((t, j) => {
      const ta = a + (j - (k - 1) / 2) * 15 * DEG;
      return { x: CX + RT * Math.cos(ta), y: CY + RT * Math.sin(ta), label: t };
    });
    return { ci: i, color: c.color, hub, tools };
  });
}

export default function ToolGalaxy() {
  const placed = useMemo(place, []);
  const [hover, setHover] = useState<number | null>(null);
  const total = CATS.reduce((n, c) => n + c.tools.length, 0);

  const on = (ci: number) => hover === null || hover === ci;

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-base" style={{ color: 'var(--text)' }}>
            {total} structured tools, one namespace
          </div>
          <div className="mt-1 text-xs" style={{ color: 'var(--text-soft)' }}>
            Every capability is a typed mcp__dbt_index__ call backed by the live index. Hover a
            category to light its tools. Detail sourced from dbt Wizard.
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {CATS.map((c, i) => (
            <span
              key={c.name}
              className="inline-flex items-center gap-1.5"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer', opacity: on(i) ? 1 : 0.4 }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color, display: 'inline-block' }} />
              {c.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 overflow-x-auto scroll-thin">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 720, display: 'block' }} role="img" aria-label="dbt Wizard MCP tools grouped by category">
          {/* edges */}
          {placed.map((p) => (
            <g key={'e' + p.ci} opacity={on(p.ci) ? 1 : 0.12} style={{ transition: 'opacity 180ms ease' }}>
              <line x1={CX} y1={CY} x2={p.hub.x} y2={p.hub.y} stroke={p.color} strokeWidth={1.4} opacity={0.5} />
              {p.tools.map((t, j) => (
                <line key={j} x1={p.hub.x} y1={p.hub.y} x2={t.x} y2={t.y} stroke={p.color} strokeWidth={1.4} opacity={0.6} />
              ))}
            </g>
          ))}

          {/* tool pills */}
          {placed.map((p) =>
            p.tools.map((t, j) => {
              const w = t.label.length * 7.4 + 18;
              return (
                <g key={`t${p.ci}-${j}`} opacity={on(p.ci) ? 1 : 0.18} style={{ transition: 'opacity 180ms ease' }}>
                  <rect x={t.x - w / 2} y={t.y - 12} width={w} height={24} rx={12} fill="var(--surface-2)" stroke={p.color} strokeWidth={1.2} />
                  <text x={t.x} y={t.y + 4} fontSize={11.5} fontFamily="'IBM Plex Mono', monospace" textAnchor="middle" fill="var(--text)">
                    {t.label}
                  </text>
                </g>
              );
            }),
          )}

          {/* category hubs */}
          {placed.map((p) => {
            const w = p.hub.name.length * 6.6 + 22;
            return (
              <g
                key={'h' + p.ci}
                onMouseEnter={() => setHover(p.ci)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer' }}
                opacity={on(p.ci) ? 1 : 0.25}
              >
                <rect x={p.hub.x - w / 2} y={p.hub.y - 13} width={w} height={26} rx={7} fill={p.color} opacity={0.16} stroke={p.color} strokeWidth={1.6} />
                <text x={p.hub.x} y={p.hub.y + 4} fontSize={11.5} fontFamily="'IBM Plex Sans', sans-serif" fontWeight={600} textAnchor="middle" fill={p.color}>
                  {p.hub.name}
                </text>
              </g>
            );
          })}

          {/* core */}
          <circle cx={CX} cy={CY} r={46} fill="rgba(255,105,75,0.10)" stroke="var(--dbt)" strokeWidth={2} />
          <text x={CX} y={CY - 2} fontSize={12} fontFamily="'IBM Plex Mono', monospace" fontWeight={700} textAnchor="middle" fill="var(--dbt-bright)">
            mcp__
          </text>
          <text x={CX} y={CY + 14} fontSize={10.5} fontFamily="'IBM Plex Mono', monospace" textAnchor="middle" fill="var(--text-muted)">
            dbt_index
          </text>
        </svg>
      </div>
    </div>
  );
}
