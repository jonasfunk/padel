import type { PlayerProfile, PlayerTournamentResult } from '../types';

export interface PlayersState {
  players: PlayerProfile[];
  loading: boolean;
}

export type PlayersAction =
  | { type: 'SET_PLAYERS'; payload: PlayerProfile[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_STATS_LOCAL'; payload: PlayerTournamentResult[] };

export const initialPlayersState: PlayersState = {
  players: [],
  loading: true,
};

export function playersReducer(
  state: PlayersState,
  action: PlayersAction
): PlayersState {
  switch (action.type) {
    case 'SET_PLAYERS':
      return { ...state, players: action.payload, loading: false };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'UPDATE_STATS_LOCAL':
      return {
        ...state,
        players: state.players.map((p) => {
          const result = action.payload.find((r) => r.playerId === p.id);
          if (!result) return p;
          return {
            ...p,
            stats: {
              tournamentsPlayed: p.stats.tournamentsPlayed + 1,
              totalPoints: p.stats.totalPoints + result.points,
              totalMatchesPlayed: p.stats.totalMatchesPlayed + result.matchesPlayed,
              totalMatchesWon: p.stats.totalMatchesWon + result.matchesWon,
            },
          };
        }),
      };

    default:
      return state;
  }
}
