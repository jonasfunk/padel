import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import {
  tournamentReducer,
  initialTournamentState,
  type TournamentState,
  type TournamentAction,
} from './tournamentReducer';
import {
  subscribeToTournament,
  saveTournament,
  updateMatchScore,
  deleteTournament,
} from '../lib/tournamentRepository';
import { updatePlayerStats } from '../lib/playerRepository';
import { generateSchedule } from '../lib/scheduler';
import { computeStandings } from '../lib/standings';
import type { TournamentConfig, Tournament, MatchScore } from '../types';

const ACTIVE_TOURNAMENT_KEY = 'padel_active_tournament_id';

interface TournamentContextValue {
  state: TournamentState;
  dispatch: React.Dispatch<TournamentAction>;
  createTournament: (config: TournamentConfig) => Promise<void>;
  recordScore: (matchId: string, team1Score: number) => Promise<void>;
  endTournament: (saveStats: boolean) => Promise<void>;
  playAgain: () => Promise<void>;
}

const TournamentContext = createContext<TournamentContextValue | null>(null);

function makeTournamentId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tournamentReducer, initialTournamentState);

  // Track the active tournament ID — changing this re-subscribes to Firestore
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_TOURNAMENT_KEY)
  );

  useEffect(() => {
    if (!activeTournamentId) return;

    const unsub = subscribeToTournament(
      activeTournamentId,
      (tournament) => dispatch({ type: 'SET_TOURNAMENT', payload: tournament }),
      () => {
        localStorage.removeItem(ACTIVE_TOURNAMENT_KEY);
        setActiveTournamentId(null);
        dispatch({ type: 'CLEAR_TOURNAMENT' });
      }
    );
    return unsub;
  }, [activeTournamentId]);

  const createTournament = useCallback(async (config: TournamentConfig) => {
    const rounds = generateSchedule(config.players, config.courtCount);
    const tournament: Tournament = {
      id: makeTournamentId(),
      config,
      rounds,
      status: 'active',
      activeMatchId: null,
      createdAt: Date.now(),
    };
    localStorage.setItem(ACTIVE_TOURNAMENT_KEY, tournament.id);
    setActiveTournamentId(tournament.id); // triggers useEffect → Firestore listener
    await saveTournament(tournament);
  }, []);

  const recordScore = useCallback(
    async (matchId: string, team1Score: number) => {
      if (!state.tournament) return;
      const maxScore = state.tournament.config.maxScore;
      const score: MatchScore = { team1: team1Score, team2: maxScore - team1Score };

      dispatch({ type: 'CLOSE_MATCH' });
      await updateMatchScore(state.tournament, matchId, score);

      const updated = {
        ...state.tournament,
        rounds: state.tournament.rounds.map((round) => ({
          ...round,
          matches: round.matches.map((m) =>
            m.id === matchId ? { ...m, score, status: 'completed' as const } : m
          ),
        })),
      };
      const allDone = updated.rounds.every((r) =>
        r.matches.every((m) => m.status === 'completed')
      );
      if (allDone) {
        const standings = computeStandings({ ...updated, status: 'finished' });
        const results = standings.map((s) => ({
          playerId: s.player.id,
          tournamentId: state.tournament!.id,
          date: state.tournament!.createdAt,
          points: s.points,
          matchesPlayed: s.matchesPlayed,
          matchesWon: s.matchesWon,
        }));
        await updatePlayerStats(results);
      }
    },
    [state.tournament]
  );

  // End tournament — optionally save partial stats before deleting
  const endTournament = useCallback(async (saveStats: boolean) => {
    if (saveStats && state.tournament) {
      const standings = computeStandings(state.tournament);
      const results = standings
        .filter((s) => s.matchesPlayed > 0)
        .map((s) => ({
          playerId: s.player.id,
          tournamentId: state.tournament!.id,
          date: state.tournament!.createdAt,
          points: s.points,
          matchesPlayed: s.matchesPlayed,
          matchesWon: s.matchesWon,
        }));
      if (results.length > 0) await updatePlayerStats(results);
    }
    const id = state.tournament?.id ?? localStorage.getItem(ACTIVE_TOURNAMENT_KEY);
    if (id) {
      await deleteTournament(id);
      localStorage.removeItem(ACTIVE_TOURNAMENT_KEY);
    }
    setActiveTournamentId(null);
    dispatch({ type: 'CLEAR_TOURNAMENT' });
  }, [state.tournament]);

  // Play again with the same players and settings — generates a fresh schedule
  const playAgain = useCallback(async () => {
    if (!state.tournament) return;
    const { config } = state.tournament;
    const oldId = state.tournament.id;

    const rounds = generateSchedule(config.players, config.courtCount);
    const tournament: Tournament = {
      id: makeTournamentId(),
      config,
      rounds,
      status: 'active',
      activeMatchId: null,
      createdAt: Date.now(),
    };

    localStorage.setItem(ACTIVE_TOURNAMENT_KEY, tournament.id);
    setActiveTournamentId(tournament.id);
    await saveTournament(tournament);
    await deleteTournament(oldId);
  }, [state.tournament]);

  return (
    <TournamentContext.Provider
      value={{ state, dispatch, createTournament, recordScore, endTournament, playAgain }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error('useTournament must be used within TournamentProvider');
  return ctx;
}
