import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { dataUrl } from '../types'
import type { PageContent } from '../types'
import { adjacent, NAV } from '../nav'
import InteractionPlayer from '../components/InteractionPlayer'

function groupLabelFor(slug: string): string {
  for (const group of NAV) {
    if (group.items.some((i) => i.slug === slug)) return group.label
  }
  return 'Reference'
}

export default function FunctionalityPage() {
  const { slug = '' } = useParams()
  const [data, setData] = useState<PageContent | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setData(null)
    fetch(dataUrl('pages/' + slug + '.json'))
      .then((res) => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then((json: PageContent) => {
        if (cancelled) return
        setData(json)
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setData(null)
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (status === 'loading') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="panel p-8" style={{ color: 'var(--text-muted)' }}>
          Loading…
        </div>
      </div>
    )
  }

  if (status === 'error' || !data) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="panel p-8">
          <div className="eyebrow" style={{ color: 'var(--crisis)' }}>
            Error
          </div>
          <p className="mt-2" style={{ color: 'var(--text)' }}>
            Page content not found.
          </p>
        </div>
      </div>
    )
  }

  const groupLabel = groupLabelFor(slug)
  const { prev, next } = adjacent(slug)

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12 animate-in">
      <header className="space-y-4">
        <div className="eyebrow" style={{ color: 'var(--text-soft)' }}>
          {groupLabel}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl" style={{ color: 'var(--text)' }}>
          {data.title}
        </h1>
        <div>
          <span className="chip chip-dbt">{data.tagline}</span>
        </div>
        <p className="text-base max-w-prose" style={{ color: 'var(--text-soft)' }}>
          {data.summary}
        </p>
      </header>

      <section
        className="panel p-6"
        style={{ borderLeft: '3px solid var(--dbt)' }}
      >
        <div className="eyebrow" style={{ color: 'var(--dbt)' }}>
          VS A GENERAL CODING AGENT
        </div>
        <p className="mt-3 max-w-prose" style={{ color: 'var(--text)' }}>
          {data.whyDifferent}
        </p>
      </section>

      <section className="space-y-4">
        <div className="eyebrow" style={{ color: 'var(--text-soft)' }}>
          CAPABILITIES
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {data.capabilities.map((cap, i) => (
            <div key={i} className="panel-elev p-5 space-y-2">
              <div className="font-display text-sm" style={{ color: 'var(--text)' }}>
                {cap.title}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {cap.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {data.tools && data.tools.length > 0 && (
        <section className="space-y-4">
          <div className="eyebrow" style={{ color: 'var(--text-soft)' }}>
            MCP TOOLS ON THIS PAGE
          </div>
          <div className="space-y-4">
            {data.tools.map((tool, i) => (
              <div key={i} className="panel p-6 space-y-4">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="chip chip-dbt font-mono">{tool.name}</span>
                  {tool.signature && (
                    <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                      {tool.signature}
                    </span>
                  )}
                </div>
                <p className="text-sm max-w-prose" style={{ color: 'var(--text-soft)' }}>
                  {tool.purpose}
                </p>
                {tool.params && tool.params.length > 0 && (
                  <table className="ref-table w-full text-sm">
                    <thead>
                      <tr>
                        <th>Param</th>
                        <th>Type</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tool.params.map((p, pi) => (
                        <tr key={pi}>
                          <td className="font-mono">{p.name}</td>
                          <td className="font-mono" style={{ color: 'var(--text-muted)' }}>
                            {p.type || '—'}
                          </td>
                          <td style={{ color: 'var(--text-soft)' }}>{p.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {tool.returns && (
                  <div>
                    <div className="eyebrow" style={{ color: 'var(--teal)' }}>
                      Returns
                    </div>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-soft)' }}>
                      {tool.returns}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="eyebrow" style={{ color: 'var(--text-soft)' }}>
          PROMPTS THAT INVOKE THIS
        </div>
        <div className="space-y-4">
          {data.examplePrompts.map((ex, i) => (
            <div key={i} className="panel-elev p-5 space-y-3">
              <div className="font-mono text-sm">
                <span style={{ color: 'var(--dbt)' }}>{'> '}</span>
                <span style={{ color: 'var(--text)' }}>{ex.prompt}</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {ex.intent}
              </p>
              <div className="flex flex-wrap gap-2">
                {ex.invokes.map((name, ii) => (
                  <span key={ii} className="chip chip-muted font-mono text-xs">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <InteractionPlayer interaction={data.interaction} />
      </section>

      <section className="space-y-4">
        <div className="eyebrow" style={{ color: 'var(--text-soft)' }}>
          SE TALKING POINTS
        </div>
        <div className="panel p-6">
          <ul className="space-y-3">
            {data.seNotes.map((note, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="pulse-dot mt-2 shrink-0" />
                <span className="text-sm" style={{ color: 'var(--text-soft)' }}>
                  {note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <nav className="flex items-stretch justify-between gap-4 pt-4">
        {prev ? (
          <Link to={'/p/' + prev.slug} className="panel-elev p-4 flex-1 max-w-xs">
            <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>
              Previous
            </div>
            <div className="mt-1 text-sm" style={{ color: 'var(--text)' }}>
              {prev.label}
            </div>
          </Link>
        ) : (
          <div className="flex-1 max-w-xs" />
        )}
        {next ? (
          <Link
            to={'/p/' + next.slug}
            className="panel-elev p-4 flex-1 max-w-xs text-right"
          >
            <div className="eyebrow" style={{ color: 'var(--text-muted)' }}>
              Next
            </div>
            <div className="mt-1 text-sm" style={{ color: 'var(--text)' }}>
              {next.label}
            </div>
          </Link>
        ) : (
          <div className="flex-1 max-w-xs" />
        )}
      </nav>
    </div>
  )
}
