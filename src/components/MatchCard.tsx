import type { Match, Player } from '../types';

interface MatchCardProps {
  match: Match;
  players: Player[];
  onPress: () => void;
}

function getName(players: Player[], id: string) {
  return players.find((p) => p.id === id)?.name ?? '?';
}

export function MatchCard({ match, players, onPress }: MatchCardProps) {
  const [a, b] = match.team1;
  const [c, d] = match.team2;
  const isCompleted = match.status === 'completed';
  const isActive = match.status === 'in_progress';

  return (
    <button
      onClick={onPress}
      disabled={isCompleted}
      className={`w-full text-left rounded-xl border p-3.5 transition-all active:scale-[0.98] shadow-card ${
        isCompleted
          ? 'bg-canvas-soft border-hairline cursor-default'
          : isActive
          ? 'bg-canvas border-ink cursor-pointer'
          : 'bg-canvas border-hairline cursor-pointer'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className={`font-medium text-sm tracking-[-0.01em] truncate ${isCompleted ? 'text-mute' : 'text-ink'}`}>
            {getName(players, a)} & {getName(players, b)}
          </p>
          <p className="text-[10px] text-subtle font-medium uppercase tracking-widest">vs</p>
          <p className={`font-medium text-sm tracking-[-0.01em] truncate ${isCompleted ? 'text-mute' : 'text-ink'}`}>
            {getName(players, c)} & {getName(players, d)}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          {isCompleted && match.score ? (
            <span className="text-base font-semibold text-ink tracking-[-0.02em]">
              {match.score.team1} – {match.score.team2}
            </span>
          ) : isActive ? (
            <span className="text-xs font-medium bg-primary text-on-primary rounded-full px-2 py-0.5">
              Aktiv
            </span>
          ) : (
            <span className="text-xs text-subtle">Bane {match.court}</span>
          )}
        </div>
      </div>
    </button>
  );
}
