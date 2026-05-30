import { Link } from 'react-router-dom';
import { NAV } from '../nav';
import { Chart } from '../components/Charts';
import type { ChartSpec } from '../types';

const EFFORT_COLLAPSE: ChartSpec = {
  kind: 'compare',
  title: 'Effort before and after dbt Wizard',
  note: 'Relative effort, illustrative. Magnitudes from dbt Wizard’s own business-value framing.',
  items: [
    { label: 'Onboard into a new project', before: 100, after: 6, beforeLabel: '1–2 weeks', afterLabel: 'one session' },
    { label: 'Trace a change’s blast radius', before: 85, after: 3, beforeLabel: '30–60 min', afterLabel: 'seconds' },
    { label: 'Discover where a source lands', before: 80, after: 5, beforeLabel: 'hours', afterLabel: 'minutes' },
    { label: 'Answer a recurring question', before: 100, after: 10, beforeLabel: 'one-off query', afterLabel: 'reusable model' },
  ],
};

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <section className="animate-in">
        <div className="eyebrow" style={{ color: 'var(--dbt)' }}>
          SALES ENGINEER FIELD REFERENCE
        </div>
        <h1
          className="font-display mt-3 leading-[1.05]"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', color: 'var(--text)' }}
        >
          dbt Wizard, in depth
        </h1>
        <p
          className="mt-4 text-lg sm:text-xl"
          style={{ color: 'var(--text-muted)', maxWidth: '46ch' }}
        >
          What dbt Wizard does, the tools it calls, and the prompts that invoke
          them, page by page.
        </p>
        <p
          className="mt-6 leading-relaxed"
          style={{ color: 'var(--text-soft)', maxWidth: '70ch' }}
        >
          dbt Wizard is an AI agent for dbt projects built by Fivetran. Unlike a
          general coding agent that reads files off disk, it operates on a live,
          queryable DAG graph plus the warehouse as a single unit. It works
          through structured MCP tool calls backed by a local DuckDB index, so it
          reasons over lineage, grain, and warehouse state rather than raw text.
        </p>

        <div
          className="mt-7 panel p-5"
          style={{ borderLeft: '4px solid var(--dbt)' }}
        >
          <div className="eyebrow" style={{ color: 'var(--dbt)' }}>
            THE ONE-LINER
          </div>
          <p
            className="mt-2 font-display leading-snug"
            style={{ fontSize: 'clamp(1.1rem, 2.4vw, 1.5rem)', color: 'var(--text)' }}
          >
            dbt Wizard turns a natural-language business question into a
            materialized, tested, version-controlled dbt model, without the
            engineer ever opening a schema browser, writing a JOIN from scratch,
            or breaking a downstream dashboard.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-7">
          <span className="chip chip-teal">17 MCP tools</span>
          <span className="chip chip-violet">4 sub-agent roles</span>
          <span className="chip chip-muted">3-level skills</span>
          <span className="chip chip-teal">live DuckDB index</span>
          <span className="chip chip-muted">terminal CLI and dbt platform</span>
        </div>

        <Link
          to="/p/hol-functionality-map"
          className="group panel glow-dbt mt-8 p-5 flex items-center justify-between gap-4"
          style={{ borderColor: 'var(--dbt)' }}
        >
          <div>
            <div className="eyebrow" style={{ color: 'var(--dbt)' }}>
              THE BIG DRAW
            </div>
            <div className="font-display text-xl mt-1" style={{ color: 'var(--text)' }}>
              Watch dbt Wizard build a model live
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              The Hands-On Lab map plays the full build, tool call by tool call, with the
              validation subagent catching a grain fan-out before it ships.
            </div>
          </div>
          <span
            className="font-mono text-2xl transition-transform group-hover:translate-x-1 shrink-0"
            style={{ color: 'var(--dbt)' }}
            aria-hidden="true"
          >
            {'->'}
          </span>
        </Link>
      </section>

      <section className="mt-10">
        <Chart spec={EFFORT_COLLAPSE} />
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-12">
        {NAV.map((group, gi) => (
          <div
            key={group.label}
            className={`panel p-5 animate-in animate-in-d${Math.min(gi + 1, 3)}`}
          >
            <h2
              className="font-display text-xl"
              style={{ color: 'var(--text)' }}
            >
              {group.label}
            </h2>
            <p
              className="mt-1 text-sm leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              {group.blurb}
            </p>
            <ul className="mt-4 flex flex-col gap-1">
              {group.items.map((item) => (
                <li key={item.slug}>
                  <Link
                    to={'/p/' + item.slug}
                    className="group flex items-center justify-between rounded-md px-3 py-2 transition-colors"
                    style={{ color: 'var(--text-soft)' }}
                  >
                    <span className="text-sm">{item.label}</span>
                    <span
                      className="font-mono text-sm transition-transform group-hover:translate-x-0.5"
                      style={{ color: 'var(--dbt)' }}
                      aria-hidden="true"
                    >
                      {'->'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <footer
        className="mt-12 pt-6 text-sm"
        style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--line)' }}
      >
        This is an internal enablement artifact. dbt Wizard is built by Fivetran
        and operates on dbt Labs dbt. Functional details on this site are sourced
        from dbt Wizard itself and reflect its own description of its
        capabilities.
      </footer>
    </div>
  );
}
