import type { Tournament, Screen } from '../types';

export interface TournamentState {
  tournament: Tournament | null;
  activeScreen: Screen;
}

export type TournamentAction =
  | { type: 'SET_TOURNAMENT'; payload: Tournament }
  | { type: 'SET_ACTIVE_MATCH'; payload: { matchId: string } }
  | { type: 'CLOSE_MATCH' }
  | { type: 'CLEAR_TOURNAMENT' }
  | { type: 'NAVIGATE'; payload: Screen };

export const initialTournamentState: TournamentState = {
  tournament: null,
  activeScreen: 'setup',
};

export function tournamentReducer(
  state: TournamentState,
  action: TournamentAction
): TournamentState {
  switch (action.type) {
    case 'SET_TOURNAMENT':
      return {
        ...state,
        tournament: action.payload,
        activeScreen: action.payload.status === 'finished' ? 'standings' : state.activeScreen === 'setup' ? 'schedule' : state.activeScreen,
      };

    case 'SET_ACTIVE_MATCH':
      return {
        ...state,
        activeScreen: 'match',
        tournament: state.tournament
          ? {
              ...state.tournament,
              activeMatchId: action.payload.matchId,
              rounds: state.tournament.rounds.map((round) => ({
                ...round,
                matches: round.matches.map((m) =>
                  m.id === action.payload.matchId
                    ? { ...m, status: 'in_progress' as const }
                    : m
                ),
              })),
            }
          : null,
      };

    case 'CLOSE_MATCH':
      return {
        ...state,
        activeScreen: 'schedule',
        tournament: state.tournament
          ? {
              ...state.tournament,
              activeMatchId: null,
              // Reset in_progress back to pending
              rounds: state.tournament.rounds.map((round) => ({
                ...round,
                matches: round.matches.map((m) =>
                  m.status === 'in_progress' ? { ...m, status: 'pending' as const } : m
                ),
              })),
            }
          : null,
      };

    case 'CLEAR_TOURNAMENT':
      return { tournament: null, activeScreen: 'setup' };

    case 'NAVIGATE':
      return { ...state, activeScreen: action.payload };

    default:
      return state;
  }
}
