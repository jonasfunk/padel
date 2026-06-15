import { usePlayers } from '../context/PlayersContext';
import { Avatar } from '../components/Avatar';

const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

interface GlobalStanding {
  id: string;
  name: string;
  avatarDataUrl: string | null;
  tournamentsPlayed: number;
  totalPoints: number;
  totalMatchesPlayed: number;
  totalMatchesWon: number;
  rank: number;
}

export function StandingsScreen() {
  const { state } = usePlayers();

  const standings: GlobalStanding[] = state.players
    .map((p) => ({
      id: p.id,
      name: p.name,
      avatarDataUrl: p.avatarDataUrl,
      tournamentsPlayed: p.stats.tournamentsPlayed,
      totalPoints: p.stats.totalPoints,
      totalMatchesPlayed: p.stats.totalMatchesPlayed,
      totalMatchesWon: p.stats.totalMatchesWon,
      rank: 0,
    }))
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return b.totalMatchesWon - a.totalMatchesWon;
    });

  let rank = 1;
  for (let i = 0; i < standings.length; i++) {
    if (i > 0) {
      const prev = standings[i - 1];
      const curr = standings[i];
      if (curr.totalPoints !== prev.totalPoints || curr.totalMatchesWon !== prev.totalMatchesWon) {
        rank = i + 1;
      }
    }
    standings[i].rank = rank;
  }

  const hasData = standings.some((s) => s.tournamentsPlayed > 0);

  return (
    <div className="flex flex-col h-full bg-canvas-soft">
      <div className="px-4 pt-12 pb-4 bg-canvas border-b border-hairline">
        <h1 className="text-2xl font-semibold tracking-[-0.04em] text-ink">Stilling</h1>
        <p className="text-xs text-mute">Alle tiders resultater</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {state.loading ? (
          <p className="text-sm text-mute py-10 text-center">Henter statistik…</p>
        ) : standings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-mute">
            <span className="text-4xl">🏆</span>
            <p className="text-sm">Ingen spillere endnu</p>
          </div>
        ) : !hasData ? (
          <div className="px-4 pt-5">
            <div className="bg-canvas rounded-xl border border-hairline overflow-hidden shadow-card">
              <ul className="divide-y divide-canvas-2">
                {standings.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-6 text-center text-sm text-faint font-medium">{i + 1}</span>
                    <Avatar dataUrl={s.avatarDataUrl} name={s.name} size="sm" />
                    <span className="flex-1 text-sm font-medium tracking-[-0.01em] text-ink truncate">{s.name}</span>
                    <span className="text-xs text-faint">Ingen turneringer</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-center text-xs text-mute mt-4">Spil turneringer for at se statistik</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {standings.length >= 2 && (
              <div className="px-4 pt-6 pb-4">
                <div className="flex items-end justify-center gap-2">
                  {standings[1] && (
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <Avatar dataUrl={standings[1].avatarDataUrl} name={standings[1].name} size="md" />
                      <span className="text-xs font-medium text-body truncate max-w-full text-center tracking-[-0.01em]">
                        {standings[1].name}
                      </span>
                      <div className="w-full bg-canvas-2 border border-hairline rounded-t-xl pt-3 pb-2 flex flex-col items-center">
                        <span className="text-lg">🥈</span>
                        <span className="text-sm font-semibold tracking-[-0.02em] text-ink">{standings[1].totalPoints}</span>
                        <span className="text-[10px] text-mute">pt</span>
                      </div>
                    </div>
                  )}
                  {standings[0] && (
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <Avatar dataUrl={standings[0].avatarDataUrl} name={standings[0].name} size="lg" />
                      <span className="text-xs font-medium text-body truncate max-w-full text-center tracking-[-0.01em]">
                        {standings[0].name}
                      </span>
                      <div className="w-full bg-primary rounded-t-xl pt-4 pb-2 flex flex-col items-center">
                        <span className="text-xl">🥇</span>
                        <span className="text-base font-semibold tracking-[-0.03em] text-on-primary">{standings[0].totalPoints}</span>
                        <span className="text-[10px] text-on-primary/60">pt</span>
                      </div>
                    </div>
                  )}
                  {standings[2] && (
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <Avatar dataUrl={standings[2].avatarDataUrl} name={standings[2].name} size="md" />
                      <span className="text-xs font-medium text-body truncate max-w-full text-center tracking-[-0.01em]">
                        {standings[2].name}
                      </span>
                      <div className="w-full bg-canvas-2 border border-hairline rounded-t-xl pt-2 pb-2 flex flex-col items-center">
                        <span className="text-base">🥉</span>
                        <span className="text-sm font-semibold tracking-[-0.02em] text-ink">{standings[2].totalPoints}</span>
                        <span className="text-[10px] text-mute">pt</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full list */}
            <div className="px-4 pb-4">
              <div className="bg-canvas rounded-xl border border-hairline overflow-hidden shadow-card">
                <ul className="divide-y divide-canvas-2">
                  {standings.map((s) => (
                    <li
                      key={s.id}
                      className={`flex items-center gap-3 px-4 py-3 ${s.rank === 1 ? 'bg-canvas-soft' : ''}`}
                    >
                      <span className="w-6 text-center text-sm">
                        {medals[s.rank] ?? <span className="text-subtle text-xs font-medium">{s.rank}</span>}
                      </span>
                      <Avatar dataUrl={s.avatarDataUrl} name={s.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium tracking-[-0.01em] text-ink truncate">{s.name}</p>
                        <p className="text-[10px] text-mute">
                          {s.tournamentsPlayed} turnering{s.tournamentsPlayed !== 1 ? 'er' : ''} ·{' '}
                          {s.totalMatchesPlayed} kampe · {s.totalMatchesWon} sejr{s.totalMatchesWon !== 1 ? 'e' : ''}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-semibold tracking-[-0.03em] text-ink">{s.totalPoints}</p>
                        <p className="text-[10px] text-mute">pt total</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
