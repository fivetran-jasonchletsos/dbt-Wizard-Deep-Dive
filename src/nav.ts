// Grouped navigation so the 11 functionality pages read as 5 tidy sections
// instead of one long flat list.

export interface NavItem {
  slug: string;
  label: string;
}

export interface NavGroup {
  label: string;
  blurb: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: 'Start Here',
    blurb: 'The thesis',
    items: [{ slug: 'overview', label: 'Why dbt Wizard Is Different' }],
  },
  {
    label: 'Graph & Index Intelligence',
    blurb: 'Operating on the DAG, not files',
    items: [
      { slug: 'dag-aware-intelligence', label: 'DAG-Aware Intelligence' },
      { slug: 'live-project-index', label: 'Live Project Index' },
      { slug: 'business-context', label: 'Business Context' },
    ],
  },
  {
    label: 'Warehouse & dbt Operations',
    blurb: 'Acting on data and the project',
    items: [
      { slug: 'warehouse-integration', label: 'Warehouse Integration' },
      { slug: 'dbt-native-operations', label: 'dbt-Native Operations' },
      { slug: 'semantic-layer', label: 'Semantic Layer & Metrics' },
    ],
  },
  {
    label: 'Autonomy & Guardrails',
    blurb: 'How the agent works and stays safe',
    items: [
      { slug: 'validation-pipeline', label: 'Validation Pipeline' },
      { slug: 'agent-architecture', label: 'Agent Architecture' },
      { slug: 'skills-system', label: 'Skills System' },
    ],
  },
  {
    label: 'Reference',
    blurb: 'Every tool, one table',
    items: [{ slug: 'mcp-tool-reference', label: 'MCP Tool Reference' }],
  },
];

export const ALL_SLUGS: string[] = NAV.flatMap((g) => g.items.map((i) => i.slug));

export function flatNav(): NavItem[] {
  return NAV.flatMap((g) => g.items);
}

export function adjacent(slug: string): { prev?: NavItem; next?: NavItem } {
  const flat = flatNav();
  const i = flat.findIndex((n) => n.slug === slug);
  if (i === -1) return {};
  return { prev: flat[i - 1], next: flat[i + 1] };
}
