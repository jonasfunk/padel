export type PlayerId = string;

export interface PlayerStats {
  tournamentsPlayed: number;
  totalPoints: number;
  totalMatchesPlayed: number;
  totalMatchesWon: number;
}

export interface TournamentRecord {
  tournamentId: string;
  date: number;        // createdAt timestamp from Tournament
  points: number;
  matchesPlayed: number;
  matchesWon: number;
}

export interface PlayerProfile {
  id: PlayerId;
  name: string;
  avatarDataUrl: string | null;
  createdAt: number;
  stats: PlayerStats;
  tournamentHistory: TournamentRecord[];
}

export interface Player {
  id: PlayerId;
  name: string;
  avatarDataUrl: string | null;
}

export type MatchStatus = 'pending' | 'in_progress' | 'completed';

export interface MatchScore {
  team1: number;
  team2: number;
}

export interface Match {
  id: string;
  roundIndex: number;
  matchIndex: number;
  court: number;
  team1: [PlayerId, PlayerId];
  team2: [PlayerId, PlayerId];
  score: MatchScore | null;
  status: MatchStatus;
}

export interface Round {
  index: number;
  matches: Match[];
  byePlayers: PlayerId[];
}

export interface TournamentConfig {
  courtCount: number;
  maxScore: number;
  players: Player[];
}

export type TournamentStatus = 'active' | 'finished';

export interface Tournament {
  id: string;
  config: TournamentConfig;
  rounds: Round[];
  status: TournamentStatus;
  activeMatchId: string | null;
  createdAt: number;
}

export type Screen = 'setup' | 'schedule' | 'match' | 'standings' | 'players';

export interface AppState {
  tournament: Tournament | null;
  activeScreen: Screen;
}

export interface PlayerTournamentResult {
  playerId: PlayerId;
  tournamentId: string;
  date: number;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
}
