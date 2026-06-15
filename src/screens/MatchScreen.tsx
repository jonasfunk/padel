import { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Avatar } from '../components/Avatar';
import type { Player } from '../types';

function TeamPanel({
  players,
  score,
  maxScore,
  onIncrement,
  onDecrement,
}: {
  players: Player[];
  score: number;
  maxScore: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-4 p-4 bg-canvas rounded-2xl border border-hairline shadow-float">
      <div className="flex gap-2 flex-wrap justify-center">
        {players.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-1">
            <Avatar dataUrl={p.avatarDataUrl} name={p.name} size="md" />
            <span className="text-[10px] text-mute font-medium max-w-[60px] truncate text-center">{p.name}</span>
          </div>
        ))}
      </div>

      <span className="text-6xl font-semibold tracking-[-0.04em] text-ink leading-none">{score}</span>

      <div className="flex gap-2 w-full">
        <button
          onClick={onDecrement}
          disabled={score <= 0}
          className="flex-1 h-12 rounded-full border border-hairline bg-canvas-soft text-ink text-xl font-medium disabled:opacity-20 active:scale-95 transition-transform"
        >
          −
        </button>
        <button
          onClick={onIncrement}
          disabled={score >= maxScore}
          className="flex-1 h-12 rounded-full bg-primary text-on-primary text-xl font-medium disabled:opacity-20 active:scale-95 transition-transform"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function MatchScreen() {
  const { state, dispatch, recordScore } = useTournament();
  const [team1Score, setTeam1Score] = useState(0);
  const [saving, setSaving] = useState(false);

  const tournament = state.tournament;
  if (!tournament || !tournament.activeMatchId) return null;

  const match = tournament.rounds
    .flatMap((r) => r.matches)
    .find((m) => m.id === tournament.activeMatchId);
  if (!match) return null;

  const maxScore = tournament.config.maxScore;
  const team2Score = maxScore - team1Score;
  const players = tournament.config.players;
  const team1Players = match.team1.map((id) => players.find((p) => p.id === id)!).filter(Boolean);
  const team2Players = match.team2.map((id) => players.find((p) => p.id === id)!).filter(Boolean);

  async function handleConfirm() {
    if (!tournament?.activeMatchId) return;
    setSaving(true);
    await recordScore(tournament.activeMatchId, team1Score);
    setSaving(false);
  }

  return (
    <div className="flex flex-col h-full bg-canvas-soft">
      <div className="px-4 pt-12 pb-3 bg-canvas border-b border-hairline flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'CLOSE_MATCH' })}
          className="w-9 h-9 rounded-full border border-hairline flex items-center justify-center text-ink text-sm"
        >
          ←
        </button>
        <div>
          <p className="text-sm font-semibold tracking-[-0.02em] text-ink">Runde {match.roundIndex + 1}</p>
          <p className="text-xs text-mute">Bane {match.court} · Max {maxScore} point</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 gap-3">
        <div className="flex gap-3">
          <TeamPanel
            players={team1Players}
            score={team1Score}
            maxScore={maxScore}
            onIncrement={() => setTeam1Score((s) => Math.min(maxScore, s + 1))}
            onDecrement={() => setTeam1Score((s) => Math.max(0, s - 1))}
          />
          <TeamPanel
            players={team2Players}
            score={team2Score}
            maxScore={maxScore}
            onIncrement={() => setTeam1Score((s) => Math.max(0, s - 1))}
            onDecrement={() => setTeam1Score((s) => Math.min(maxScore, s + 1))}
          />
        </div>
        <div className="text-center text-xs text-subtle font-medium tracking-[-0.01em]">
          {team1Score} + {team2Score} = {team1Score + team2Score} / {maxScore}
        </div>
      </div>

      <div className="px-4 pb-8">
        <button
          onClick={handleConfirm}
          disabled={saving}
          className="w-full py-3.5 rounded-full bg-primary text-on-primary text-sm font-medium tracking-[-0.01em] disabled:opacity-40 active:opacity-70 transition-opacity"
        >
          {saving ? 'Gemmer…' : 'Bekræft resultat'}
        </button>
      </div>
    </div>
  );
}
