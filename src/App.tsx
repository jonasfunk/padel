import { useTournament } from './context/TournamentContext';
import { BottomNav } from './components/BottomNav';
import { ThemeToggle } from './components/ThemeToggle';
import { SetupScreen } from './screens/SetupScreen';
import { ScheduleScreen } from './screens/ScheduleScreen';
import { MatchScreen } from './screens/MatchScreen';
import { StandingsScreen } from './screens/StandingsScreen';
import { PlayersScreen } from './screens/PlayersScreen';

export default function App() {
  const { state } = useTournament();
  const { activeScreen, tournament } = state;

  if (activeScreen === 'match' && tournament) {
    return (
      <div className="flex flex-col min-h-dvh">
        <ThemeToggle />
        <MatchScreen />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <ThemeToggle />
      {activeScreen === 'players' && <PlayersScreen />}
      {activeScreen === 'standings' && <StandingsScreen />}
      {(activeScreen === 'schedule' || activeScreen === 'setup') && (
        tournament ? <ScheduleScreen /> : <SetupScreen />
      )}
      <BottomNav />
    </div>
  );
}
