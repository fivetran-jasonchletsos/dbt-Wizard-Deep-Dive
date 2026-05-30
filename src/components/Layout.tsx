import { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { NAV } from '../nav';

function NavTree({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-5">
      {NAV.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <div className="nav-group-label">{group.label}</div>
          <div
            className="text-xs mb-1 leading-snug"
            style={{ color: 'var(--text-muted)' }}
          >
            {group.blurb}
          </div>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <NavLink
                key={item.slug}
                to={'/p/' + item.slug}
                onClick={onNavigate}
                className={({ isActive }) =>
                  'nav-link' + (isActive ? ' active' : '')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onNavigate}
      className="flex items-center gap-3 no-underline"
    >
      <div
        className="rounded glow-dbt"
        style={{
          width: 30,
          height: 30,
          background: 'var(--dbt)',
          flexShrink: 0,
        }}
      />
      <div className="flex flex-col leading-none">
        <span
          className="font-display text-lg"
          style={{ color: 'var(--text)' }}
        >
          dbt Wizard
        </span>
        <span className="eyebrow mt-1" style={{ color: 'var(--text-muted)' }}>
          DEEP DIVE
        </span>
      </div>
    </Link>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const close = () => setOpen(false);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--surface-0)' }}>
      <aside
        className="panel-deep hidden lg:flex flex-col sticky top-0 self-start h-screen scroll-thin"
        style={{ width: 270, flexShrink: 0, overflowY: 'auto' }}
      >
        <div className="px-5 pt-6 pb-5">
          <Brand />
        </div>
        <div className="px-5 flex-1">
          <NavTree />
        </div>
        <div
          className="px-5 py-5 mt-4 text-xs flex flex-col gap-1"
          style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--line)' }}
        >
          <span>Fivetran SE field reference</span>
          <span>dbt Wizard runs on dbt Labs dbt</span>
          <span style={{ color: 'var(--text-soft)' }}>Details sourced from dbt Wizard</span>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="panel-deep sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6"
          style={{ height: 56, borderRadius: 0 }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
              className="lg:hidden flex flex-col justify-center gap-1.5 p-2 rounded"
              style={{ border: '1px solid var(--line)' }}
            >
              <span style={{ width: 18, height: 2, background: 'var(--text)' }} />
              <span style={{ width: 18, height: 2, background: 'var(--text)' }} />
              <span style={{ width: 18, height: 2, background: 'var(--text)' }} />
            </button>
            <div className="lg:hidden">
              <Brand />
            </div>
          </div>
          <span className="chip chip-dbt">Built by Fivetran</span>
        </header>

        {open && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div
              onClick={close}
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.6)' }}
            />
            <div
              className="panel-deep absolute top-0 left-0 h-full scroll-thin"
              style={{ width: 280, overflowY: 'auto', borderRadius: 0 }}
            >
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--line)' }}
              >
                <Brand onNavigate={close} />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close navigation"
                  className="px-2 py-1 rounded font-mono text-sm"
                  style={{ border: '1px solid var(--line)', color: 'var(--text-muted)' }}
                >
                  X
                </button>
              </div>
              <div className="px-5 py-5">
                <NavTree onNavigate={close} />
              </div>
              <div
                className="px-5 py-5 text-xs flex flex-col gap-1"
                style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--line)' }}
              >
                <span>Fivetran SE field reference</span>
                <span>dbt Wizard runs on dbt Labs dbt</span>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 w-full">
          <div
            key={location.pathname}
            className="max-w-5xl mx-auto px-4 lg:px-8 py-8 animate-in"
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
