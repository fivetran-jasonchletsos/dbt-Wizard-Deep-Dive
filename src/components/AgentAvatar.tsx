import type { AgentRole } from '../types';
import { AGENT_META } from '../types';

interface AgentAvatarProps {
  role: AgentRole;
  active?: boolean;
  size?: number;
}

export default function AgentAvatar({ role, active = false, size = 40 }: AgentAvatarProps) {
  const meta = AGENT_META[role] ?? { name: String(role), code: '??', color: 'var(--text-muted)' };
  return (
    <span
      className={'agent-avatar' + (active ? ' active' : '')}
      style={{
        color: meta.color,
        height: size,
        width: size,
        fontSize: Math.max(10, size * 0.3),
      }}
      title={meta.name}
    >
      {meta.code}
    </span>
  );
}
