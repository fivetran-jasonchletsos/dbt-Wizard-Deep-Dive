import { useMemo, useState } from 'react';

// The lab's model DAG. Click a node to see the downstream blast radius dbt Wizard's
// impact tool would report, colored by severity. Lineage upstream is shown in teal.
// Structure mirrors the HOL project (stg -> int_orders_enriched -> marts).

interface Node {
  id: string;
  label: string;
  layer: number; // 0 sources, 1 staging, 2 intermediate, 3 marts
}

const LAYER_NAME = ['Sources', 'Staging', 'Intermediate', 'Marts'];

const NODES: Node[] = [
  { id: 'src_orders', label: 'raw.orders', layer: 0 },
  { id: 'src_tickets', label: 'raw.tickets', layer: 0 },
  { id: 'src_products', label: 'raw.products', layer: 0 },
  { id: 'src_customers', label: 'raw.customers', layer: 0 },
  { id: 'stg_orders', label: 'stg_orders', layer: 1 },
  { id: 'stg_tickets', label: 'stg_tickets', layer: 1 },
  { id: 'stg_products', label: 'stg_products', layer: 1 },
  { id: 'stg_customers', label: 'stg_customers', layer: 1 },
  { id: 'int_orders_enriched', label: 'int_orders_enriched', layer: 2 },
  { id: 'fct_orders', label: 'fct_orders', layer: 3 },
  { id: 'orders_by_week', label: 'orders_by_week', layer: 3 },
  { id: 'dim_customers', label: 'dim_customers', layer: 3 },
  { id: 'dim_products', label: 'dim_products', layer: 3 },
];

const EDGES: [string, string][] = [
  ['src_orders', 'stg_orders'],
  ['src_tickets', 'stg_tickets'],
  ['src_products', 'stg_products'],
  ['src_customers', 'stg_customers'],
  ['stg_orders', 'int_orders_enriched'],
  ['stg_tickets', 'int_orders_enriched'],
  ['int_orders_enriched', 'fct_orders'],
  ['stg_products', 'fct_orders'],
  ['fct_orders', 'orders_by_week'],
  ['stg_customers', 'dim_customers'],
  ['stg_products', 'dim_products'],
];

const SEV = [
  { key: 'critical', color: 'var(--sev-critical)', label: 'Critical' },
  { key: 'high', color: 'var(--sev-high)', label: 'High' },
  { key: 'medium', color: 'var(--sev-medium)', label: 'Medium' },
  { key: 'low', color: 'var(--sev-low)', label: 'Low' },
];
const sevFor = (hops: number) => (hops <= 1 ? 0 : hops === 2 ? 1 : hops === 3 ? 2 : 3);

const W = 940;
const H = 520;
const NODE_W = 152;
const NODE_H = 34;
const LAYER_X = [86, 330, 560, 854];

function layout() {
  const pos: Record<string, { x: number; y: number }> = {};
  for (let l = 0; l < 4; l++) {
    const inLayer = NODES.filter((n) => n.layer === l);
    inLayer.forEach((n, i) => {
      pos[n.id] = { x: LAYER_X[l], y: ((i + 0.5) * H) / inLayer.length };
    });
  }
  return pos;
}

// Downstream BFS with hop distance from a start node.
function downstream(start: string): Record<string, number> {
  const out: Record<string, number> = {};
  let frontier = [start];
  let hop = 0;
  const seen = new Set([start]);
  while (frontier.length) {
    hop += 1;
    const next: string[] = [];
    for (const id of frontier) {
      for (const [a, b] of EDGES) {
        if (a === id && !seen.has(b)) {
          seen.add(b);
          out[b] = hop;
          next.push(b);
        }
      }
    }
    frontier = next;
  }
  return out;
}
function upstream(start: string): Set<string> {
  const out = new Set<string>();
  let frontier = [start];
  const seen = new Set([start]);
  while (frontier.length) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const [a, b] of EDGES) {
        if (b === id && !seen.has(a)) {
          seen.add(a);
          out.add(a);
          next.push(a);
        }
      }
    }
    frontier = next;
  }
  return out;
}

export default function LineageGraph() {
  const pos = useMemo(layout, []);
  const [selected, setSelected] = useState('int_orders_enriched');

  const down = useMemo(() => downstream(selected), [selected]);
  const up = useMemo(() => upstream(selected), [selected]);
  const labelOf = (id: string) => NODES.find((n) => n.id === id)?.label ?? id;

  const roleOf = (id: string): { role: 'sel' | 'down' | 'up' | 'none'; sev?: number } => {
    if (id === selected) return { role: 'sel' };
    if (id in down) return { role: 'down', sev: sevFor(down[id]) };
    if (up.has(id)) return { role: 'up' };
    return { role: 'none' };
  };

  const downstreamList = Object.entries(down)
    .map(([id, hop]) => ({ id, label: labelOf(id), sev: sevFor(hop) }))
    .sort((a, b) => a.sev - b.sev);

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-base" style={{ color: 'var(--text)' }}>
            Lineage and impact, live on the DAG
          </div>
          <div className="mt-1 text-xs" style={{ color: 'var(--text-soft)' }}>
            Click any model. dbt Wizard's impact tool reports the downstream blast radius colored by
            severity; lineage shows the upstream path that feeds it. Illustrative project graph.
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {SEV.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: 'inline-block' }} />
              {s.label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--teal)', display: 'inline-block' }} />
            Upstream
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto scroll-thin">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 760, display: 'block' }} role="img" aria-label="Model lineage graph with impact highlighting">
          {/* layer headers */}
          {LAYER_NAME.map((nm, l) => (
            <text key={nm} x={LAYER_X[l]} y={16} fontSize={11} fontFamily="'IBM Plex Mono', monospace" letterSpacing="0.12em" textAnchor="middle" fill="var(--text-soft)">
              {nm.toUpperCase()}
            </text>
          ))}

          {/* edges */}
          {EDGES.map(([a, b], k) => {
            const pa = pos[a];
            const pb = pos[b];
            const x1 = pa.x + NODE_W / 2;
            const x2 = pb.x - NODE_W / 2;
            const onDownPath = (a === selected || a in down) && b in down;
            const onUpPath = (b === selected || up.has(b)) && up.has(a);
            let stroke = 'var(--line)';
            let opacity = 0.5;
            let width = 1.3;
            if (onDownPath) {
              stroke = SEV[sevFor(down[b])].color;
              opacity = 0.9;
              width = 2.3;
            } else if (onUpPath) {
              stroke = 'var(--teal)';
              opacity = 0.8;
              width = 2;
            } else if (selected) {
              opacity = 0.12;
            }
            return (
              <path
                key={k}
                d={`M ${x1} ${pa.y} C ${x1 + 70} ${pa.y}, ${x2 - 70} ${pb.y}, ${x2} ${pb.y}`}
                fill="none"
                stroke={stroke}
                strokeWidth={width}
                opacity={opacity}
                style={{ transition: 'opacity 200ms ease, stroke 200ms ease' }}
              />
            );
          })}

          {/* nodes */}
          {NODES.map((n) => {
            const p = pos[n.id];
            const { role, sev } = roleOf(n.id);
            const color =
              role === 'sel' ? 'var(--dbt)' : role === 'down' ? SEV[sev!].color : role === 'up' ? 'var(--teal)' : 'var(--line-bright)';
            const dim = selected && role === 'none' ? 0.34 : 1;
            return (
              <g
                key={n.id}
                onClick={() => setSelected(n.id)}
                style={{ cursor: 'pointer' }}
                opacity={dim}
              >
                <rect
                  x={p.x - NODE_W / 2}
                  y={p.y - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx={7}
                  fill={role === 'sel' ? 'rgba(255,105,75,0.12)' : 'var(--surface-2)'}
                  stroke={color}
                  strokeWidth={role === 'sel' ? 2.4 : 1.4}
                />
                <text
                  x={p.x}
                  y={p.y + 4}
                  fontSize={12}
                  fontFamily="'IBM Plex Mono', monospace"
                  textAnchor="middle"
                  fill="var(--text)"
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* impact readout */}
      <div className="mt-4 panel-deep p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-dbt font-mono">impact</span>
          <span className="font-mono text-sm" style={{ color: 'var(--text)' }}>
            {labelOf(selected)}
          </span>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {downstreamList.length === 0
              ? 'has no downstream consumers — safe to change.'
              : `would affect ${downstreamList.length} downstream model${downstreamList.length > 1 ? 's' : ''}:`}
          </span>
        </div>
        {downstreamList.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {downstreamList.map((d) => (
              <span
                key={d.id}
                className="chip font-mono"
                style={{ color: SEV[d.sev].color, borderColor: SEV[d.sev].color, background: 'transparent' }}
              >
                {d.label} · {SEV[d.sev].label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
