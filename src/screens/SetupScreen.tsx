import { useState } from 'react';
import { usePlayers } from '../context/PlayersContext';
import { useTournament } from '../context/TournamentContext';
import { Avatar } from '../components/Avatar';
import type { Player } from '../types';

export function SetupScreen() {
  const { state: playersState } = usePlayers();
  const { createTournament, dispatch } = useTournament();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [courtCount, setCourtCount] = useState(1);
  const [maxScore, setMaxScore] = useState(16);
  const [loading, setLoading] = useState(false);

  const maxCourts = Math.floor(selectedIds.size / 4);

  function togglePlayer(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      const newMax = Math.floor(next.size / 4);
      if (courtCount > newMax) setCourtCount(Math.max(1, newMax));
      return next;
    });
  }

  async function handleStart() {
    if (selectedIds.size < 4) return;
    setLoading(true);
    const players: Player[] = playersState.players
      .filter((p) => selectedIds.has(p.id))
      .map((p) => ({ id: p.id, name: p.name, avatarDataUrl: p.avatarDataUrl }));
    await createTournament({ courtCount, maxScore, players });
    setLoading(false);
  }

  const canStart = selectedIds.size >= 4 && !loading;

  return (
    <div className="flex flex-col h-full bg-canvas-soft">
      <div className="px-4 pt-12 pb-4 bg-canvas border-b border-hairline">
        <h1 className="text-2xl font-semibold tracking-[-0.04em] text-ink">Ny turnering</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-48">
        <div className="px-4 pt-5">
          <p className="text-[11px] font-medium text-mute uppercase tracking-widest mb-3">
            Spillere ({selectedIds.size} valgt)
          </p>

          {playersState.loading ? (
            <p className="text-sm text-mute py-4 text-center">Henter spillere…</p>
          ) : playersState.players.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-sm text-mute">Ingen spillere oprettet endnu.</p>
              <button
                onClick={() => dispatch({ type: 'NAVIGATE', payload: 'players' })}
                className="text-sm font-medium text-ink underline underline-offset-2"
              >
                Opret spillere
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {playersState.players.map((player) => {
                const selected = selectedIds.has(player.id);
                return (
                  <button
                    key={player.id}
                    onClick={() => togglePlayer(player.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98] shadow-card ${
                      selected
                        ? 'bg-primary border-primary'
                        : 'bg-canvas border-hairline'
                    }`}
                  >
                    <Avatar dataUrl={player.avatarDataUrl} name={player.name} size="sm" />
                    <span className={`flex-1 text-left text-sm font-medium tracking-[-0.01em] ${selected ? 'text-on-primary' : 'text-ink'}`}>
                      {player.name}
                    </span>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] flex-shrink-0 ${
                        selected
                          ? 'bg-on-primary border-on-primary text-primary'
                          : 'border-hairline-strong'
                      }`}
                    >
                      {selected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
              <button
                onClick={() => dispatch({ type: 'NAVIGATE', payload: 'players' })}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-hairline-strong text-mute text-sm"
              >
                <span className="w-8 h-8 rounded-full bg-canvas-2 flex items-center justify-center text-base">+</span>
                Tilføj spiller
              </button>
            </div>
          )}
        </div>

        {selectedIds.size >= 4 && (
          <div className="px-4 mt-6 space-y-5">
            <div>
              <p className="text-[11px] font-medium text-mute uppercase tracking-widest mb-3">Antal baner</p>
              <div className="flex gap-2">
                {Array.from({ length: maxCourts }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setCourtCount(n)}
                    className={`flex-1 py-2.5 rounded-full text-sm font-medium border transition-all active:scale-95 ${
                      courtCount === n
                        ? 'bg-primary border-primary text-on-primary'
                        : 'bg-canvas border-hairline text-ink'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-medium text-mute uppercase tracking-widest mb-3">Max score</p>
              <div className="flex gap-2">
                {[16, 21, 24, 32].map((s) => (
                  <button
                    key={s}
                    onClick={() => setMaxScore(s)}
                    className={`flex-1 py-2.5 rounded-full text-sm font-medium border transition-all active:scale-95 ${
                      maxScore === s
                        ? 'bg-primary border-primary text-on-primary'
                        : 'bg-canvas border-hairline text-ink'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-canvas border-t border-hairline">
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="w-full py-3.5 rounded-full bg-primary text-on-primary text-sm font-medium tracking-[-0.01em] disabled:opacity-30 transition-opacity active:opacity-70"
        >
          {loading ? 'Opretter…' : `Start turnering (${selectedIds.size} spillere)`}
        </button>
      </div>
    </div>
  );
}
