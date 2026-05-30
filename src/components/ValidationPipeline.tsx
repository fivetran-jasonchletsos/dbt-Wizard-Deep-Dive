// The auto-validation gate as a process diagram, not a bar chart. A model edit
// fires the validation subagent automatically; it runs a four-step checklist and
// a row-count / grain gate that passes the safe change and would flag a fan-out.
// Numbers illustrative; detail sourced from dbt Wizard.

const W = 940;
const H = 470;
const BW = 168;
const BH = 50;

interface Box {
  x: number;
  y: number;
  title: string;
  sub?: string;
  color: string;
  w?: number;
  h?: number;
}

function Node({ b }: { b: Box }) {
  const w = b.w ?? BW;
  const h = b.h ?? BH;
  return (
    <g>
      <rect x={b.x - w / 2} y={b.y - h / 2} width={w} height={h} rx={9} fill="var(--surface-2)" stroke={b.color} strokeWidth={1.6} />
      <rect x={b.x - w / 2} y={b.y - h / 2} width={5} height={h} rx={2} fill={b.color} />
      <text x={b.x - w / 2 + 16} y={b.sub ? b.y - 4 : b.y + 4} fontSize={13} fontFamily="'IBM Plex Mono', monospace" fontWeight={600} fill="var(--text)">
        {b.title}
      </text>
      {b.sub ? (
        <text x={b.x - w / 2 + 16} y={b.y + 14} fontSize={10} fontFamily="'IBM Plex Sans', sans-serif" fill="var(--text-muted)">
          {b.sub}
        </text>
      ) : null}
    </g>
  );
}

const edge = (x1: number, y1: number, x2: number, y2: number) =>
  `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;

const CHECKS: Box[] = [
  { x: 130, y: 215, title: 'SQL check', sub: 'compiles, parses', color: 'var(--sev-medium)', w: 150 },
  { x: 360, y: 215, title: 'dbt run --defer', sub: 'builds vs prod state', color: 'var(--sev-medium)', w: 150 },
  { x: 590, y: 215, title: 'prod vs dev', sub: 'row-count compare', color: 'var(--sev-medium)', w: 150 },
  { x: 820, y: 215, title: 'impact', sub: 'downstream blast radius', color: 'var(--sev-medium)', w: 150 },
];

export default function ValidationPipeline() {
  const edit: Box = { x: 130, y: 70, title: 'Model edit', sub: 'worker authors the change', color: '#a78bfa', w: 178 };
  const validation: Box = { x: 380, y: 70, title: 'validation subagent', sub: 'auto-fires, no prompt', color: '#30c48d', w: 188 };
  // Numbers canonical with scenario-extend.json (4,310 tickets across 2,887 ticketed orders
  // => +1,423 duplicate rows on a raw join). Keep these two in sync if either changes.
  const pass: Box = { x: 290, y: 380, title: 'PASS — safe to merge', sub: 'dev 18,402 = prod 18,402, grain held', color: '#30c48d', w: 320, h: 56 };
  const flag: Box = { x: 670, y: 380, title: 'WOULD FLAG', sub: 'a naive join reads 19,825 (+1,423), blocked', color: '#f0564d', w: 320, h: 56 };

  const rOf = (b: Box) => b.x + (b.w ?? BW) / 2;
  const lOf = (b: Box) => b.x - (b.w ?? BW) / 2;
  const bOf = (b: Box) => b.y + (b.h ?? BH) / 2;
  const tOf = (b: Box) => b.y - (b.h ?? BH) / 2;

  return (
    <div className="panel p-5">
      <div className="font-display text-base" style={{ color: 'var(--text)' }}>
        The validation gate, step by step
      </div>
      <div className="mt-1 text-xs" style={{ color: 'var(--text-soft)' }}>
        Every model edit auto-fires the validation subagent. It runs a four-step checklist and a
        grain / row-count gate: the pre-aggregated fix passes, while the naive join that would have
        fanned out is flagged before merge. Numbers illustrative; detail sourced from dbt Wizard.
      </div>

      <div className="mt-4 overflow-x-auto scroll-thin">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 760, display: 'block' }} role="img" aria-label="dbt Wizard validation pipeline diagram">
          {/* edit -> validation (auto) */}
          <path className="flow-edge" d={edge(rOf(edit), edit.y, lOf(validation), validation.y)} fill="none" stroke="var(--resolved)" strokeWidth={2} opacity={0.85} />
          <text x={(rOf(edit) + lOf(validation)) / 2} y={edit.y - 12} fontSize={10} fontFamily="'IBM Plex Mono', monospace" textAnchor="middle" fill="var(--text-soft)">
            on every edit
          </text>
          {/* validation down to first check */}
          <path className="flow-edge" d={edge(validation.x, bOf(validation), CHECKS[0].x, tOf(CHECKS[0]))} fill="none" stroke="var(--resolved)" strokeWidth={2} opacity={0.7} />
          {/* checklist left -> right */}
          {CHECKS.slice(0, -1).map((c, i) => (
            <path key={i} className="flow-edge" d={edge(rOf(c), c.y, lOf(CHECKS[i + 1]), CHECKS[i + 1].y)} fill="none" stroke="#4aa8ff" strokeWidth={2} opacity={0.8} />
          ))}
          {/* last check down to the two verdicts */}
          <path className="flow-edge" d={edge(CHECKS[3].x, bOf(CHECKS[3]), pass.x, tOf(pass))} fill="none" stroke="var(--resolved)" strokeWidth={2.2} opacity={0.9} />
          <path d={edge(CHECKS[3].x, bOf(CHECKS[3]), flag.x, tOf(flag))} fill="none" stroke="var(--sev-critical)" strokeWidth={1.6} opacity={0.5} strokeDasharray="3 5" />

          <Node b={edit} />
          <Node b={validation} />
          {CHECKS.map((c, i) => (
            <Node key={i} b={c} />
          ))}
          <Node b={pass} />
          <Node b={flag} />

          <text x={pass.x} y={tOf(pass) - 8} fontSize={10} fontFamily="'IBM Plex Mono', monospace" textAnchor="middle" fill="var(--resolved)">
            grain held
          </text>
          <text x={flag.x} y={tOf(flag) - 8} fontSize={10} fontFamily="'IBM Plex Mono', monospace" textAnchor="middle" fill="var(--sev-critical)">
            counterfactual: naive join
          </text>
        </svg>
      </div>
    </div>
  );
}
