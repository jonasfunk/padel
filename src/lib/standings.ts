import type { Tournament, Player } from '../types';

export interface PlayerStanding {
  player: Player;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  rank: number;
}

export function computeStandings(tournament: Tournament): PlayerStanding[] {
  const { config, rounds } = tournament;
  const playerMap = new Map(config.players.map((p) => [p.id, p]));

  const stats = new Map<string, { points: number; played: number; won: number }>();
  for (const player of config.players) {
    stats.set(player.id, { points: 0, played: 0, won: 0 });
  }

  for (const round of rounds) {
    for (const match of round.matches) {
      if (match.status !== 'completed' || !match.score) continue;

      const { team1, team2 } = match.score;
      const team1Won = team1 > team2;

      for (const id of match.team1) {
        const s = stats.get(id);
        if (!s) continue;
        s.points += team1;
        s.played += 1;
        if (team1Won) s.won += 1;
      }
      for (const id of match.team2) {
        const s = stats.get(id);
        if (!s) continue;
        s.points += team2;
        s.played += 1;
        if (!team1Won) s.won += 1;
      }
    }
  }

  const standings: PlayerStanding[] = config.players.map((player) => {
    const s = stats.get(player.id) ?? { points: 0, played: 0, won: 0 };
    return {
      player,
      points: s.points,
      matchesPlayed: s.played,
      matchesWon: s.won,
      rank: 0,
    };
  });

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.matchesWon - a.matchesWon;
  });

  let rank = 1;
  for (let i = 0; i < standings.length; i++) {
    if (i > 0) {
      const prev = standings[i - 1];
      const curr = standings[i];
      if (curr.points !== prev.points || curr.matchesWon !== prev.matchesWon) {
        rank = i + 1;
      }
    }
    standings[i].rank = rank;
  }

  // Bring back original player reference with avatar
  return standings.map((s) => ({
    ...s,
    player: playerMap.get(s.player.id) ?? s.player,
  }));
}
