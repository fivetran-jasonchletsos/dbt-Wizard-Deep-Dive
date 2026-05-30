// ---------------------------------------------------------------------------
// Content contract — mirrors the JSON authored by the content workflow and
// served from public/data/pages/<slug>.json.
// ---------------------------------------------------------------------------

export type EventKind = 'user' | 'narration' | 'tool_call' | 'tool_result' | 'code' | 'final';
export type AgentRole =
  | 'user' | 'wizard' | 'explorer' | 'summary' | 'worker' | 'validation' | 'verification' | 'test_writer' | 'system';
export type CodeLang = 'sql' | 'yaml' | 'json' | 'bash' | 'text';

export interface InteractionEvent {
  kind: EventKind;
  agent: AgentRole;
  body?: string;
  toolName?: string;
  toolArgs?: string;
  code?: string;
  codeLang?: CodeLang;
  sideEffect?: string;
}

export interface ToolParam {
  name: string;
  type?: string;
  desc: string;
}

export interface ToolDoc {
  name: string;
  signature?: string;
  purpose: string;
  params?: ToolParam[];
  returns?: string;
}

export interface ExamplePrompt {
  prompt: string;
  intent: string;
  invokes: string[];
}

export interface Capability {
  title: string;
  detail: string;
}

export type ChartKind = 'bars' | 'compare';
export interface ChartDatum {
  label: string;
  value: number;
  display?: string;
  color?: string;
}
export interface CompareItem {
  label: string;
  before: number;
  after: number;
  beforeLabel?: string;
  afterLabel?: string;
}
export interface ChartSpec {
  kind: ChartKind;
  title: string;
  note?: string;
  unit?: string;
  data?: ChartDatum[];
  items?: CompareItem[];
  legendA?: string;
  legendB?: string;
}

export interface PageContent {
  slug: string;
  title: string;
  tagline: string;
  order?: number;
  summary: string;
  whyDifferent: string;
  tools?: ToolDoc[];
  capabilities: Capability[];
  charts?: ChartSpec[];
  examplePrompts: ExamplePrompt[];
  interaction: {
    scenario: string;
    userPrompt: string;
    events: InteractionEvent[];
  };
  seNotes: string[];
}

// ---------------------------------------------------------------------------
// Agent presentation metadata — color-codes the transcript bubbles + avatars.
// ---------------------------------------------------------------------------
export interface AgentMeta {
  name: string;
  code: string;
  color: string;
}

export const AGENT_META: Record<AgentRole, AgentMeta> = {
  user:         { name: 'Sales Engineer', code: 'SE',  color: '#9aa0aa' },
  wizard:       { name: 'dbt Wizard',      code: 'DW',  color: '#ff694b' },
  explorer:     { name: 'Explorer',        code: 'EXP', color: '#4aa8ff' },
  summary:      { name: 'Summary',         code: 'SUM', color: '#00b4a0' },
  worker:       { name: 'Worker',          code: 'WRK', color: '#a78bfa' },
  validation:   { name: 'Validation',      code: 'VAL', color: '#30c48d' },
  verification: { name: 'Validation',      code: 'VAL', color: '#30c48d' },
  test_writer:  { name: 'Test Writer',     code: 'TST', color: '#f5a623' },
  system:       { name: 'System',          code: 'SYS', color: '#6b7280' },
};

// Resolve a data URL honoring the Vite base path (GitHub Pages subdirectory).
export function dataUrl(path: string): string {
  const base = (import.meta as unknown as { env: { BASE_URL: string } }).env.BASE_URL || '/';
  return `${base.replace(/\/$/, '')}/data/${path}`;
}
