import { useState } from 'react';

// The Snowflake Summit 2026 HOL, mapped. Left = the 5 lab prompts attendees type.
// Right = the dbt Wizard functionality each one triggers. Edges connect them.
// Detail sourced from dbt Wizard itself.

type Kind = 'tool' | 'agent' | 'skill';

interface PromptNode {
  id: string;
  label: string;
  color: string;
  targets: string[];
}
interface FuncNode {
  id: string;
  label: string;
  kind: Kind;
}

const PROMPTS: PromptNode[] = [
  { id: 'S1.1', label: 'S1.1  Onboard & orient', color: '#4aa8ff', targets: ['status', 'search', 'describe', 'lineage', 'sk_onboarding'] },
  { id: 'S1.2', label: 'S1.2  Live data sample', color: '#00b4a0', targets: ['describe', 'warehouse'] },
  { id: 'S1.3', label: 'S1.3  Build orders_by_week', color: '#ff694b', targets: ['describe', 'lineage', 'dbt_compile', 'dbt_show', 'ag_worker', 'ag_validation', 'ag_test_writer'] },
  { id: 'S2.1', label: 'S2.1  Tickets joined?', color: '#a78bfa', targets: ['describe', 'lineage', 'search', 'ag_explorer'] },
  { id: 'S2.2', label: 'S2.2  Extend safely', color: '#f5a623', targets: ['describe', 'impact', 'dbt_compile', 'dbt_show', 'warehouse', 'diff', 'ag_worker', 'ag_validation', 'ag_test_writer', 'sk_scenario2'] },
];

const FUNCS: FuncNode[] = [
  { id: 'status', label: 'status', kind: 'tool' },
  { id: 'search', label: 'search', kind: 'tool' },
  { id: 'describe', label: 'describe', kind: 'tool' },
  { id: 'lineage', label: 'lineage', kind: 'tool' },
  { id: 'impact', label: 'impact', kind: 'tool' },
  { id: 'warehouse', label: 'warehouse', kind: 'tool' },
  { id: 'dbt_compile', label: 'dbt_compile', kind: 'tool' },
  { id: 'dbt_show', label: 'dbt_show', kind: 'tool' },
  { id: 'diff', label: 'diff', kind: 'tool' },
  { id: 'ag_worker', label: 'worker', kind: 'agent' },
  { id: 'ag_validation', label: 'validation', kind: 'agent' },
  { id: 'ag_explorer', label: 'explorer', kind: 'agent' },
  { id: 'ag_test_writer', label: 'test_writer', kind: 'agent' },
  { id: 'sk_onboarding', label: 'onboarding skill', kind: 'skill' },
  { id: 'sk_scenario2', label: 'scenario-2 skill', kind: 'skill' },
];

const KIND_COLOR: Record<Kind, string> = {
  tool: '#00b4a0',
  agent: '#a78bfa',
  skill: '#f5a623',
};

const W = 940;
const H = 580;
const PROMPT_W = 236;
const PROMPT_X = 8;
const FUNC_W = 196;
const FUNC_X = W - FUNC_W - 8;

const promptY = (i: number) => ((i + 0.5) * H) / PROMPTS.length;
const funcY = (j: number) => ((j + 0.5) * H) / FUNCS.length;

const usage: Record<string, number> = {};
for (const f of FUNCS) usage[f.id] = PROMPTS.filter((p) => p.targets.includes(f.id)).length;

export default function HolFlowMap() {
  const [hoverP, setHoverP] = useState<string | null>(null);
  const [hoverF, setHoverF] = useState<string | null>(null);
  const idle = !hoverP && !hoverF;

  const edges: { p: PromptNode; f: FuncNode; pi: number; fj: number }[] = [];
  PROMPTS.forEach((p, pi) =>
    FUNCS.forEach((f, fj) => {
      if (p.targets.includes(f.id)) edges.push({ p, f, pi, fj });
    }),
  );

  const edgeState = (p: PromptNode, f: FuncNode) => {
    if (idle) return 'idle';
    if (hoverP === p.id || hoverF === f.id) return 'on';
    return 'off';
  };
  const promptActive = (p: PromptNode) => {
    if (idle) return true;
    if (hoverP) return hoverP === p.id;
    return hoverF ? p.targets.includes(hoverF) : true;
  };
  const funcActive = (f: FuncNode) => {
    if (idle) return true;
    if (hoverF) return hoverF === f.id;
    return hoverP ? PROMPTS.find((p) => p.id === hoverP)!.targets.includes(f.id) : true;
  };

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-base" style={{ color: 'var(--text)' }}>
            The lab, mapped to dbt Wizard functionality
          </div>
          <div className="mt-1 text-xs" style={{ color: 'var(--text-soft)' }}>
            Hover a prompt to trace what it fires, or hover a capability to see which prompts use it.
            The count on each capability is how many of the five prompts trigger it.
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <Legend swatch={KIND_COLOR.tool} label="MCP tool" />
          <Legend swatch={KIND_COLOR.agent} label="subagent" />
          <Legend swatch={KIND_COLOR.skill} label="skill" />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto scroll-thin">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ minWidth: 720, display: 'block' }}
          role="img"
          aria-label="Hands-on lab prompts mapped to dbt Wizard tools, subagents, and skills"
        >
          {/* edges */}
          {edges.map(({ p, f, pi, fj }, k) => {
            const x1 = PROMPT_X + PROMPT_W;
            const y1 = promptY(pi);
            const x2 = FUNC_X;
            const y2 = funcY(fj);
            const st = edgeState(p, f);
            return (
              <path
                key={k}
                d={`M ${x1} ${y1} C ${x1 + 150} ${y1}, ${x2 - 150} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke={p.color}
                strokeWidth={st === 'on' ? 2.5 : 1.4}
                opacity={st === 'on' ? 0.95 : st === 'off' ? 0.05 : 0.4}
                style={{ transition: 'opacity 180ms ease, stroke-width 180ms ease' }}
              />
            );
          })}

          {/* prompt nodes */}
          {PROMPTS.map((p, i) => {
            const y = promptY(i);
            const active = promptActive(p);
            return (
              <g
                key={p.id}
                onMouseEnter={() => setHoverP(p.id)}
                onMouseLeave={() => setHoverP(null)}
                style={{ cursor: 'pointer' }}
                opacity={active ? 1 : 0.25}
              >
                <rect
                  x={PROMPT_X}
                  y={y - 23}
                  width={PROMPT_W}
                  height={46}
                  rx={9}
                  fill="var(--surface-2)"
                  stroke={p.color}
                  strokeWidth={hoverP === p.id ? 2.4 : 1.4}
                />
                <rect x={PROMPT_X} y={y - 23} width={5} height={46} rx={2} fill={p.color} />
                <text
                  x={PROMPT_X + 18}
                  y={y + 5}
                  fontSize={14}
                  fontFamily="'IBM Plex Mono', monospace"
                  fontWeight={600}
                  fill="var(--text)"
                >
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* func nodes */}
          {FUNCS.map((f, j) => {
            const y = funcY(j);
            const active = funcActive(f);
            const c = KIND_COLOR[f.kind];
            return (
              <g
                key={f.id}
                onMouseEnter={() => setHoverF(f.id)}
                onMouseLeave={() => setHoverF(null)}
                style={{ cursor: 'pointer' }}
                opacity={active ? 1 : 0.22}
              >
                <rect
                  x={FUNC_X}
                  y={y - 13}
                  width={FUNC_W}
                  height={26}
                  rx={13}
                  fill="var(--surface-2)"
                  stroke={c}
                  strokeWidth={hoverF === f.id ? 2.2 : 1.2}
                />
                <text
                  x={FUNC_X + 16}
                  y={y + 4}
                  fontSize={12.5}
                  fontFamily="'IBM Plex Mono', monospace"
                  fill="var(--text)"
                >
                  {f.label}
                </text>
                <circle cx={FUNC_X + FUNC_W - 17} cy={y} r={9} fill={c} opacity={0.18} />
                <text
                  x={FUNC_X + FUNC_W - 17}
                  y={y + 4}
                  fontSize={11}
                  fontFamily="'IBM Plex Mono', monospace"
                  fontWeight={700}
                  fill={c}
                  textAnchor="middle"
                >
                  {usage[f.id]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 text-xs" style={{ color: 'var(--text-soft)' }}>
        describe fires on every prompt: introspecting grain, keys, and columns from the live index is
        the backbone of the whole lab. Detail sourced from dbt Wizard.
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span style={{ width: 10, height: 10, borderRadius: 3, background: swatch, display: 'inline-block' }} />
      {label}
    </span>
  );
}
