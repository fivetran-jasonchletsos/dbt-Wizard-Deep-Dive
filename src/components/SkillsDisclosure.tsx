// Progressive disclosure as a staircase, not a bar chart: three levels load at
// different times, and only Level 1 stays resident — that is the token efficiency.
// Token figures illustrative; detail sourced from dbt Wizard.

interface Tier {
  level: string;
  title: string;
  body: string;
  tokens: string;
  when: string;
  color: string;
  indent: number;
}

const TIERS: Tier[] = [
  {
    level: 'Level 1',
    title: 'Frontmatter metadata',
    body: 'Name and description, roughly 100 words. Always in context; used to match the skill to your prompt.',
    tokens: '~130 tokens',
    when: 'always loaded',
    color: 'var(--teal)',
    indent: 0,
  },
  {
    level: 'Level 2',
    title: 'SKILL.md body',
    body: 'The workflow instructions, kept under 500 lines. Read into context only once the skill triggers.',
    tokens: '~1,800 tokens',
    when: 'on trigger',
    color: 'var(--alert)',
    indent: 40,
  },
  {
    level: 'Level 3',
    title: 'Bundled resources',
    body: 'scripts/, references/, assets/ — executable scripts, schemas, and templates. Pulled in only when a step needs them.',
    tokens: '~6,200 tokens',
    when: 'on demand',
    color: 'var(--dbt)',
    indent: 80,
  },
];

export default function SkillsDisclosure() {
  return (
    <div className="panel p-5">
      <div className="font-display text-base" style={{ color: 'var(--text)' }}>
        Three levels, loaded just in time
      </div>
      <div className="mt-1 text-xs" style={{ color: 'var(--text-soft)' }}>
        Only Level 1 stays resident. Deeper levels load progressively, so a large skill library costs
        almost nothing in context until a skill actually fires. Token figures illustrative; detail
        sourced from dbt Wizard.
      </div>

      <div className="mt-5 overflow-x-auto scroll-thin">
        <div style={{ minWidth: 460 }}>
          {TIERS.map((t, i) => (
            <div key={t.level}>
              {i > 0 ? (
                <div
                  className="flex items-center gap-2 py-1"
                  style={{ marginLeft: t.indent - 20, color: 'var(--text-soft)' }}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 5v14M6 13l6 6 6-6" />
                  </svg>
                  <span className="eyebrow">{t.when}</span>
                </div>
              ) : null}
              <div
                className="panel-elev p-4 flex flex-wrap items-center justify-between gap-3"
                style={{ marginLeft: t.indent, borderLeft: `4px solid ${t.color}` }}
              >
                <div style={{ minWidth: 0, flex: '1 1 260px' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="eyebrow" style={{ color: t.color }}>
                      {t.level}
                    </span>
                    <span className="font-display text-sm" style={{ color: 'var(--text)' }}>
                      {t.title}
                    </span>
                    {i === 0 ? (
                      <span className="chip chip-teal" style={{ fontSize: 8, padding: '1px 6px' }}>
                        always loaded
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs mt-1 leading-snug" style={{ color: 'var(--text-muted)' }}>
                    {t.body}
                  </div>
                </div>
                <span className="font-mono text-xs whitespace-nowrap" style={{ color: t.color }}>
                  {t.tokens}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
