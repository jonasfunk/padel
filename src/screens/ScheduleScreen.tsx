import { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { MatchCard } from '../components/MatchCard';
import { Avatar } from '../components/Avatar';
import { computeStandings } from '../lib/standings';

const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

type Dialog = 'end' | 'new' | null;

export function ScheduleScreen() {
  const { state, dispatch, endTournament, playAgain } = useTournament();
  const [dialog, setDialog] = useState<Dialog>(null);

  const tournament = state.tournament;
  if (!tournament) return null;

  const players = tournament.config.players;
  const allMatches = tournament.rounds.flatMap((r) => r.matches);
  const completedMatches = allMatches.filter((m) => m.status === 'completed').length;
  const totalMatches = allMatches.length;
  const isFinished = tournament.status === 'finished';
  const hasPlayedSome = completedMatches > 0;
  const standings = computeStandings(tournament);

  return (
    <div className="flex flex-col h-full bg-canvas-soft">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 bg-canvas border-b border-hairline flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-ink">Turnering</h1>
          <p className="text-xs text-mute">
            {isFinished ? 'Afsluttet' : `${completedMatches} / ${totalMatches} kampe`}
          </p>
        </div>
        {!isFinished && (
          <button
            onClick={() => setDialog('end')}
            className="rounded-full border border-error/30 text-error text-xs font-medium px-3 py-1.5 active:opacity-70"
          >
            Afslut
          </button>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto px-4 pt-4 space-y-5 ${isFinished ? 'pb-44' : 'pb-24'}`}>
        {/* Current standings */}
        <div className="bg-canvas rounded-xl border border-hairline overflow-hidden shadow-card">
          <div className="px-4 py-2.5 border-b border-hairline">
            <p className="text-[11px] font-medium text-mute uppercase tracking-widest">Stilling</p>
          </div>
          <ul className="divide-y divide-canvas-2">
            {standings.map((s) => (
              <li key={s.player.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-6 text-center text-sm">
                  {medals[s.rank] ?? <span className="text-subtle text-xs font-medium">{s.rank}</span>}
                </span>
                <Avatar dataUrl={s.player.avatarDataUrl} name={s.player.name} size="sm" />
                <span className="flex-1 text-sm font-medium tracking-[-0.01em] text-ink truncate">
                  {s.player.name}
                </span>
                <span className="text-sm font-semibold tracking-[-0.02em] text-ink">{s.points}</span>
                <span className="text-xs text-mute w-5 text-right">pt</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rounds */}
        {tournament.rounds.map((round) => {
          const allDone = round.matches.every((m) => m.status === 'completed');
          return (
            <div key={round.index}>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-sm font-semibold tracking-[-0.02em] text-ink">Runde {round.index + 1}</h2>
                {allDone && (
                  <span className="text-[10px] text-mute font-medium uppercase tracking-widest">Færdig ✓</span>
                )}
              </div>

              <div className="space-y-2">
                {round.matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    players={players}
                    onPress={() => dispatch({ type: 'SET_ACTIVE_MATCH', payload: { matchId: match.id } })}
                  />
                ))}
              </div>

              {round.byePlayers.length > 0 && (
                <div className="mt-2.5 flex items-center gap-2 px-1">
                  <span className="text-[10px] text-subtle uppercase tracking-widest font-medium">Hviler</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {round.byePlayers.map((id) => {
                      const p = players.find((pl) => pl.id === id);
                      if (!p) return null;
                      return (
                        <div key={id} className="flex items-center gap-1">
                          <Avatar dataUrl={p.avatarDataUrl} name={p.name} size="sm" />
                          <span className="text-xs text-mute">{p.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Finished actions */}
      {isFinished && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-3 pt-3 bg-gradient-to-t from-canvas-soft via-canvas-soft to-transparent space-y-2">
          <button
            onClick={playAgain}
            className="w-full py-3.5 rounded-full bg-primary text-on-primary text-sm font-medium tracking-[-0.01em] active:opacity-70 transition-opacity"
          >
            Spil igen (samme spillere)
          </button>
          <button
            onClick={() => setDialog('new')}
            className="w-full py-3.5 rounded-full border border-hairline bg-canvas text-ink text-sm font-medium tracking-[-0.01em] active:opacity-70 transition-opacity"
          >
            Ny turnering
          </button>
        </div>
      )}

      {/* Dialog: Afslut */}
      {dialog === 'end' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-canvas rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 space-y-3 shadow-modal">
            <p className="text-base font-semibold tracking-[-0.02em] text-ink">Afslut turnering</p>
            <p className="text-sm text-mute">
              {hasPlayedSome
                ? 'Der er spillet kampe. Vil du gemme resultaterne i statistikken?'
                : 'Ingen kampe er spillet endnu. Turneringen slettes.'}
            </p>
            <div className="pt-1 space-y-2">
              {hasPlayedSome && (
                <button
                  onClick={() => { setDialog(null); endTournament(true); }}
                  className="w-full py-3 rounded-full bg-primary text-on-primary text-sm font-medium active:opacity-70"
                >
                  Gem resultater og afslut
                </button>
              )}
              <button
                onClick={() => { setDialog(null); endTournament(false); }}
                className="w-full py-3 rounded-full border border-error/30 text-error text-sm font-medium active:opacity-70"
              >
                {hasPlayedSome ? 'Afslut uden at gemme' : 'Afslut'}
              </button>
              <button
                onClick={() => setDialog(null)}
                className="w-full py-3 rounded-full border border-hairline text-ink text-sm font-medium active:opacity-70"
              >
                Annuller
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Ny turnering */}
      {dialog === 'new' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-canvas rounded-2xl p-6 w-full max-w-xs space-y-4 shadow-modal">
            <p className="text-base font-semibold tracking-[-0.02em] text-ink">Ny turnering?</p>
            <p className="text-sm text-mute">
              Du går til opsætning og kan vælge nye spillere og indstillinger.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setDialog(null)}
                className="flex-1 py-2.5 rounded-full border border-hairline text-sm font-medium text-ink active:opacity-70"
              >
                Annuller
              </button>
              <button
                onClick={() => { setDialog(null); endTournament(false); }}
                className="flex-1 py-2.5 rounded-full bg-primary text-on-primary text-sm font-medium active:opacity-70"
              >
                Ny turnering
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
