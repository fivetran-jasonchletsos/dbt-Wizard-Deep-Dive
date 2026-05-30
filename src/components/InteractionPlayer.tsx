import { useState, useEffect, useRef, useMemo } from 'react';
import AgentAvatar from './AgentAvatar';
import CodeBlock from './CodeBlock';
import { AGENT_META } from '../types';
import type { InteractionEvent } from '../types';

interface InteractionPlayerProps {
  interaction: {
    scenario: string;
    userPrompt: string;
    events: InteractionEvent[];
  };
}

type Mode = 'transcript' | 'play';

function primaryText(ev: InteractionEvent): string | null {
  if (ev.kind === 'narration' || ev.kind === 'final' || ev.kind === 'user') return ev.body || null;
  if (ev.kind === 'code') return ev.code || null;
  if (ev.kind === 'tool_call') return ev.toolArgs || null;
  return null;
}

function agentName(role: InteractionEvent['agent']): string {
  return AGENT_META[role]?.name || role;
}
function agentColor(role: InteractionEvent['agent']): string {
  return AGENT_META[role]?.color || 'var(--text)';
}

function UserBlock({ text }: { text: string }) {
  return (
    <div className="flex justify-end animate-in">
      <div
        className="panel-elev px-4 py-3 max-w-[85%]"
        style={{ borderLeft: '3px solid var(--text-soft)' }}
      >
        <div className="eyebrow mb-1" style={{ color: 'var(--text-muted)' }}>
          Sales Engineer
        </div>
        <div className="font-mono text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
          {text}
        </div>
      </div>
    </div>
  );
}

function EventRow({
  ev,
  text,
  typing,
}: {
  ev: InteractionEvent;
  text: string | null;
  typing: boolean;
}) {
  const color = agentColor(ev.agent);
  const cursor = typing ? <span className="chat-cursor" /> : null;

  if (ev.kind === 'user') {
    return (
      <div className="flex justify-end animate-in">
        <div className="panel-elev px-4 py-3 max-w-[85%]" style={{ borderLeft: '3px solid var(--text-soft)' }}>
          <div className="eyebrow mb-1" style={{ color: 'var(--text-muted)' }}>
            Sales Engineer
          </div>
          <div className="font-mono text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
            {text ?? ''}
            {cursor}
          </div>
        </div>
      </div>
    );
  }

  if (ev.kind === 'narration') {
    return (
      <div className="flex gap-3 items-start animate-in">
        <AgentAvatar role={ev.agent} />
        <div className="panel-elev px-4 py-3 flex-1" style={{ borderLeft: `3px solid ${color}` }}>
          <div className="text-sm font-semibold mb-1" style={{ color }}>
            {agentName(ev.agent)}
          </div>
          <div className="chat-bubble text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
            {text ?? ''}
            {cursor}
          </div>
        </div>
      </div>
    );
  }

  if (ev.kind === 'tool_call') {
    return (
      <div className="panel-deep px-4 py-3 animate-in">
        <div className="flex items-center justify-between mb-2 gap-3">
          <div className="flex items-center gap-2">
            <span className="eyebrow" style={{ color: 'var(--dbt)' }}>
              tool call
            </span>
            <span className="chip chip-dbt font-mono text-xs">{ev.toolName || 'tool'}</span>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {agentName(ev.agent)}
          </span>
        </div>
        <CodeBlock code={text ?? ''} lang="json" />
        {typing ? <span className="chat-cursor" /> : null}
      </div>
    );
  }

  if (ev.kind === 'tool_result') {
    return (
      <div className="panel-deep px-4 py-3 animate-in">
        <div className="eyebrow mb-2" style={{ color: 'var(--teal)' }}>
          result
        </div>
        {ev.body ? (
          <div className="font-mono text-sm whitespace-pre-wrap mb-2" style={{ color: 'var(--text)' }}>
            {ev.body}
          </div>
        ) : null}
        {ev.code ? <CodeBlock code={ev.code} lang={ev.codeLang || 'json'} /> : null}
      </div>
    );
  }

  if (ev.kind === 'code') {
    return (
      <div className="panel px-4 py-3 animate-in">
        <div className="eyebrow mb-2" style={{ color: 'var(--text-muted)' }}>
          {ev.codeLang || 'sql'} authoring
        </div>
        <CodeBlock code={text ?? ''} lang={ev.codeLang || 'sql'} />
        {typing ? <span className="chat-cursor" /> : null}
      </div>
    );
  }

  if (ev.kind === 'final') {
    return (
      <div
        className="px-4 py-4 rounded-lg animate-in"
        style={{ borderLeft: '4px solid var(--dbt)', background: 'rgba(255,105,75,0.06)' }}
      >
        <div className="flex gap-3 items-start">
          <AgentAvatar role="wizard" />
          <div className="flex-1">
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--dbt)' }}>
              dbt Wizard
            </div>
            <div className="chat-bubble text-sm whitespace-pre-wrap" style={{ color: 'var(--text)', maxWidth: '68ch' }}>
              {text ?? ''}
              {cursor}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function InteractionPlayer({ interaction }: InteractionPlayerProps) {
  const { scenario, userPrompt, events } = interaction;
  const [mode, setMode] = useState<Mode>('transcript');
  const [speed, setSpeed] = useState<number>(1);
  const [playing, setPlaying] = useState<boolean>(false);
  const [cursor, setCursor] = useState<number>(0);
  const [typed, setTyped] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const showOpening = useMemo(
    () => events.length > 0 && events[0].kind !== 'user',
    [events]
  );

  // Autoscroll on any visible change.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mode, cursor, typed]);

  // Play-mode typing / advancing engine.
  useEffect(() => {
    if (mode !== 'play' || !playing) return;
    if (cursor >= events.length) {
      setPlaying(false);
      return;
    }
    const ev = events[cursor];
    const text = primaryText(ev);
    const dwell = 450 / speed;

    if (text != null && text.length > 0) {
      if (typed < text.length) {
        const isCode = ev.kind === 'code' || ev.kind === 'tool_call';
        const per = (isCode ? 3 : 10) / speed;
        // Reveal in small chunks to keep timers reasonable for long code.
        const step = isCode ? Math.max(2, Math.ceil(text.length / 240)) : 1;
        const t = setTimeout(() => {
          setTyped((v) => Math.min(text.length, v + step));
        }, per);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => {
        setCursor((c) => c + 1);
        setTyped(0);
      }, dwell);
      return () => clearTimeout(t);
    }

    // No primary text: brief dwell then advance.
    const t = setTimeout(() => {
      setCursor((c) => c + 1);
      setTyped(0);
    }, 400 / speed);
    return () => clearTimeout(t);
  }, [mode, playing, speed, cursor, typed, events]);

  function enterTranscript() {
    setMode('transcript');
    setPlaying(false);
  }
  function enterPlay() {
    setMode('play');
    setCursor(0);
    setTyped(0);
    setPlaying(true);
  }
  function restart() {
    setCursor(0);
    setTyped(0);
    setPlaying(true);
  }
  function cycleSpeed() {
    setSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1));
  }

  // Determine which events to render and how far the current one is typed.
  const renderList: { ev: InteractionEvent; text: string | null; typing: boolean }[] = useMemo(() => {
    if (mode === 'transcript') {
      return events.map((ev) => ({ ev, text: primaryText(ev), typing: false }));
    }
    const out: { ev: InteractionEvent; text: string | null; typing: boolean }[] = [];
    for (let i = 0; i < Math.min(cursor + 1, events.length); i++) {
      const ev = events[i];
      const full = primaryText(ev);
      if (i < cursor) {
        out.push({ ev, text: full, typing: false });
      } else {
        const partial = full == null ? null : full.slice(0, typed);
        out.push({ ev, text: partial, typing: playing && full != null });
      }
    }
    return out;
  }, [mode, events, cursor, typed, playing]);

  const isPlay = mode === 'play';

  return (
    <div className="panel p-5">
      <div
        className="flex items-center gap-2 mb-4 pb-3"
        style={{ borderBottom: '1px solid var(--line-soft)' }}
      >
        <span style={{ width: 10, height: 10, borderRadius: 999, background: 'var(--crisis)' }} />
        <span style={{ width: 10, height: 10, borderRadius: 999, background: 'var(--alert)' }} />
        <span style={{ width: 10, height: 10, borderRadius: 999, background: 'var(--resolved)' }} />
        <span className="font-mono text-xs ml-2" style={{ color: 'var(--text-soft)' }}>
          dbt-wizard — interactive session
        </span>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <div className="eyebrow mb-1" style={{ color: 'var(--dbt)' }}>
            Live interaction
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {scenario}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex">
            <button
              className="btn"
              onClick={enterTranscript}
              style={
                !isPlay
                  ? { background: 'var(--surface-3)', color: 'var(--text)' }
                  : { color: 'var(--text-muted)' }
              }
            >
              Transcript
            </button>
            <button
              className="btn"
              onClick={enterPlay}
              style={
                isPlay
                  ? { background: 'var(--surface-3)', color: 'var(--text)' }
                  : { color: 'var(--text-muted)' }
              }
            >
              Play
            </button>
          </div>
          {isPlay ? (
            <>
              <button className="btn btn-teal" onClick={cycleSpeed}>
                {speed}x
              </button>
              <button className="btn" onClick={restart}>
                Restart
              </button>
            </>
          ) : null}
        </div>
      </div>

      {showOpening ? (
        <div className="mb-4">
          <UserBlock text={userPrompt} />
        </div>
      ) : null}

      <div ref={scrollRef} className="scroll-thin overflow-y-auto flex flex-col gap-4" style={{ maxHeight: '60vh' }}>
        {renderList.map((item, i) => (
          <EventRow key={i} ev={item.ev} text={item.text} typing={item.typing} />
        ))}
      </div>
    </div>
  );
}
