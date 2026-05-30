// How dbt Wizard fans a task out across subagents: the orchestrator spawns
// explorers and a worker in parallel (up to 10 concurrent), the validation
// subagent auto-fires after the edit, then submit_summary hands off a structured
// result. Detail sourced from dbt Wizard.

const W = 940;
const H = 430;

interface Box {
  id: string;
  x: number;
  y: number;
  title: string;
  sub?: string;
  color: string;
  w?: number;
}

const PARALLEL: Box[] = [
  { id: 'explorer1', x: 470, y: 70, title: 'explorer', sub: 'scoped Q in parallel', color: '#4aa8ff' },
  { id: 'explorer2', x: 470, y: 150, title: 'explorer', sub: 'scoped Q in parallel', color: '#4aa8ff' },
  { id: 'worker', x: 470, y: 250, title: 'worker', sub: 'authors model SQL', color: '#a78bfa' },
  { id: 'test_writer', x: 470, y: 330, title: 'test_writer', sub: 'writes schema.yml tests', color: '#f5a623' },
];

const BOX_W = 168;
const BOX_H = 52;

function Node({ b, w = BOX_W }: { b: Box; w?: number }) {
  return (
    <g>
      <rect x={b.x - w / 2} y={b.y - BOX_H / 2} width={w} height={BOX_H} rx={9} fill="var(--surface-2)" stroke={b.color} strokeWidth={1.6} />
      <rect x={b.x - w / 2} y={b.y - BOX_H / 2} width={5} height={BOX_H} rx={2} fill={b.color} />
      <text x={b.x - w / 2 + 16} y={b.y - 4} fontSize={13.5} fontFamily="'IBM Plex Mono', monospace" fontWeight={600} fill="var(--text)">
        {b.title}
      </text>
      {b.sub ? (
        <text x={b.x - w / 2 + 16} y={b.y + 13} fontSize={10.5} fontFamily="'IBM Plex Sans', sans-serif" fill="var(--text-muted)">
          {b.sub}
        </text>
      ) : null}
    </g>
  );
}

function edge(x1: number, y1: number, x2: number, y2: number) {
  return `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;
}

export default function AgentOrchestration() {
  const user: Box = { id: 'user', x: 80, y: 200, title: 'prompt', sub: 'business question', color: '#9aa0aa' };
  const wizard: Box = { id: 'wizard', x: 270, y: 200, title: 'dbt Wizard', sub: 'orchestrator', color: '#ff694b' };
  const validation: Box = { id: 'validation', x: 690, y: 200, title: 'validation', sub: 'auto-fires after edit', color: '#30c48d' };
  const summary: Box = { id: 'summary', x: 868, y: 200, title: 'submit_summary', sub: 'structured handoff', color: '#6b7280', w: 150 };

  const rOf = (b: Box, w = BOX_W) => b.x + w / 2;
  const lOf = (b: Box, w = BOX_W) => b.x - w / 2;

  return (
    <div className="panel p-5">
      <div className="font-display text-base" style={{ color: 'var(--text)' }}>
        One prompt, many agents
      </div>
      <div className="mt-1 text-xs" style={{ color: 'var(--text-soft)' }}>
        dbt Wizard spawns specialized subagents and runs them in parallel, up to 10 concurrent. The
        validation subagent fires automatically after every model edit, then submit_summary hands off
        a structured result. Detail sourced from dbt Wizard.
      </div>

      <div className="mt-4 overflow-x-auto scroll-thin">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 760, display: 'block' }} role="img" aria-label="dbt Wizard subagent orchestration diagram">
          {/* parallel bracket */}
          <line x1={388} y1={44} x2={388} y2={356} stroke="var(--line-bright)" strokeWidth={1.2} strokeDasharray="2 4" />
          <text x={388} y={34} fontSize={10.5} fontFamily="'IBM Plex Mono', monospace" letterSpacing="0.1em" textAnchor="middle" fill="var(--text-soft)">
            PARALLEL · UP TO 10
          </text>

          {/* edges: user -> wizard */}
          <path className="flow-edge" d={edge(rOf(user), user.y, lOf(wizard), wizard.y)} fill="none" stroke="var(--text-soft)" strokeWidth={2} opacity={0.8} />
          {/* wizard -> each parallel agent (fan out) */}
          {PARALLEL.map((b) => (
            <path key={'o' + b.id} className="flow-edge" d={edge(rOf(wizard), wizard.y, lOf(b), b.y)} fill="none" stroke={b.color} strokeWidth={2} opacity={0.85} />
          ))}
          {/* each parallel agent -> validation (fan in) */}
          {PARALLEL.map((b) => (
            <path key={'i' + b.id} className="flow-edge" d={edge(rOf(b), b.y, lOf(validation), validation.y)} fill="none" stroke="var(--resolved)" strokeWidth={1.8} opacity={0.55} />
          ))}
          {/* validation -> summary */}
          <path className="flow-edge" d={edge(rOf(validation), validation.y, lOf(summary, 150), summary.y)} fill="none" stroke="var(--text-soft)" strokeWidth={2} opacity={0.8} />

          {/* nodes */}
          <Node b={user} />
          <Node b={wizard} />
          {PARALLEL.map((b) => (
            <Node key={b.id} b={b} />
          ))}
          <Node b={validation} />
          <Node b={summary} w={150} />

          {/* validation detail */}
          <text x={690} y={250} fontSize={10.5} fontFamily="'IBM Plex Mono', monospace" textAnchor="middle" fill="var(--text-soft)">
            SQL check · run --defer
          </text>
          <text x={690} y={266} fontSize={10.5} fontFamily="'IBM Plex Mono', monospace" textAnchor="middle" fill="var(--text-soft)">
            prod vs dev · impact
          </text>
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="chip chip-resolved font-mono">result</span>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          a versioned, tested dbt model in the repo, with a breaking vs non-breaking impact summary and
          the downstream consumers it touches.
        </span>
      </div>
    </div>
  );
}
