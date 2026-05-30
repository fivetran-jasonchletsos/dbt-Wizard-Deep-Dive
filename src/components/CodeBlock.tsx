import type { CodeLang } from '../types';

interface CodeBlockProps {
  code: string;
  lang?: CodeLang;
  cursor?: boolean;
  className?: string;
}

interface Span {
  text: string;
  cls?: string;
}

const SQL_KEYWORDS = new Set([
  'select', 'from', 'where', 'with', 'as', 'join', 'left', 'right', 'inner',
  'on', 'and', 'or', 'group', 'by', 'order', 'desc', 'asc', 'case', 'when',
  'then', 'else', 'end', 'null', 'true', 'false', 'distinct', 'count', 'sum',
  'max', 'min', 'avg', 'coalesce', 'nullif', 'cast', 'over', 'partition',
]);

// Hoisted so each pattern compiles once, not per rendered line. The SQL fallback
// class must NOT exclude '{', or a lone brace (not part of {{ }} / {% %}) matches
// no group and is silently dropped from the rendered code.
const SQL_RE = /(\{\{[^]*?\}\}|\{%[^]*?%\})|('(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([^\sA-Za-z0-9_']+)/g;
const JSON_RE = /("(?:[^"\\]|\\.)*")(\s*:)?|(\b-?\d+(?:\.\d+)?\b)|\b(true|false|null)\b|(\s+)|([^\s"]+)/g;

function esc(s: string): React.ReactNode {
  return s;
}

function tokenizeSql(line: string): Span[] {
  const spans: Span[] = [];
  const commentIdx = line.indexOf('--');
  let body = line;
  let comment = '';
  if (commentIdx >= 0) {
    body = line.slice(0, commentIdx);
    comment = line.slice(commentIdx);
  }
  SQL_RE.lastIndex = 0;
  const re = SQL_RE;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    if (m[1]) spans.push({ text: m[1], cls: 'tok-jinja' });
    else if (m[2]) spans.push({ text: m[2], cls: 'tok-str' });
    else if (m[3]) spans.push({ text: m[3], cls: 'tok-num' });
    else if (m[4]) {
      const lower = m[4].toLowerCase();
      spans.push({ text: m[4], cls: SQL_KEYWORDS.has(lower) ? 'tok-kw' : undefined });
    } else if (m[5]) spans.push({ text: m[5] });
    else if (m[6]) spans.push({ text: m[6], cls: 'tok-punc' });
  }
  if (comment) spans.push({ text: comment, cls: 'tok-com' });
  return spans;
}

function tokenizeYaml(line: string): Span[] {
  const spans: Span[] = [];
  const hashIdx = line.indexOf('#');
  let body = line;
  let comment = '';
  if (hashIdx >= 0) {
    body = line.slice(0, hashIdx);
    comment = line.slice(hashIdx);
  }
  const lead = body.match(/^(\s*)(- )?/);
  let rest = body;
  if (lead) {
    if (lead[1]) spans.push({ text: lead[1] });
    if (lead[2]) spans.push({ text: lead[2], cls: 'tok-punc' });
    rest = body.slice(lead[0].length);
  }
  const keyMatch = rest.match(/^([A-Za-z0-9_.-]+)(\s*:)/);
  if (keyMatch) {
    spans.push({ text: keyMatch[1], cls: 'tok-key' });
    spans.push({ text: keyMatch[2], cls: 'tok-punc' });
    spans.push({ text: rest.slice(keyMatch[0].length) });
  } else {
    spans.push({ text: rest });
  }
  if (comment) spans.push({ text: comment, cls: 'tok-com' });
  return spans;
}

function tokenizeJson(line: string): Span[] {
  const spans: Span[] = [];
  JSON_RE.lastIndex = 0;
  const re = JSON_RE;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m[1]) {
      spans.push({ text: m[1], cls: m[2] ? 'tok-key' : 'tok-str' });
      if (m[2]) spans.push({ text: m[2], cls: 'tok-punc' });
    } else if (m[3]) spans.push({ text: m[3], cls: 'tok-num' });
    else if (m[4]) spans.push({ text: m[4], cls: 'tok-kw' });
    else if (m[5]) spans.push({ text: m[5] });
    else if (m[6]) spans.push({ text: m[6], cls: 'tok-punc' });
  }
  return spans;
}

function tokenizePlain(line: string): Span[] {
  const hashIdx = line.indexOf('#');
  if (hashIdx >= 0) {
    return [
      { text: line.slice(0, hashIdx) },
      { text: line.slice(hashIdx), cls: 'tok-com' },
    ];
  }
  return [{ text: line }];
}

function tokenizeLine(line: string, lang: CodeLang): Span[] {
  switch (lang) {
    case 'sql':
      return tokenizeSql(line);
    case 'yaml':
      return tokenizeYaml(line);
    case 'json':
      return tokenizeJson(line);
    default:
      return tokenizePlain(line);
  }
}

export default function CodeBlock({ code, lang = 'text', cursor, className }: CodeBlockProps) {
  if (!code || !code.trim()) {
    return (
      <pre className={'code-panel m-0 p-4 overflow-x-auto scroll-thin ' + (className || '')}>
        <span style={{ color: 'var(--text-soft)' }}>(no code)</span>
      </pre>
    );
  }
  const lines = code.replace(/\n$/, '').split('\n');
  return (
    <pre className={'code-panel m-0 p-4 overflow-x-auto scroll-thin ' + (className || '')}>
      {lines.map((line, i) => {
        const spans = tokenizeLine(line, lang);
        return (
          <span key={i}>
            {spans.map((s, j) =>
              s.cls ? (
                <span key={j} className={s.cls}>{esc(s.text)}</span>
              ) : (
                <span key={j}>{esc(s.text)}</span>
              )
            )}
            {i < lines.length - 1 ? '\n' : null}
          </span>
        );
      })}
      {cursor ? <span className="code-cursor" /> : null}
    </pre>
  );
}
