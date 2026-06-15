import { useTournament } from '../context/TournamentContext';
import type { Screen } from '../types';

const tabs: { screen: Screen; label: string; emoji: string }[] = [
  { screen: 'schedule', label: 'Turnering', emoji: '🎾' },
  { screen: 'standings', label: 'Stilling', emoji: '🏆' },
  { screen: 'players', label: 'Spillere', emoji: '😎' },
];

export function BottomNav() {
  const { state, dispatch } = useTournament();
  const active = state.activeScreen;

  return (
    <nav className="flex-shrink-0 bg-canvas border-t border-hairline flex">
      {tabs.map((tab) => {
        const isActive =
          active === tab.screen ||
          (tab.screen === 'schedule' && active === 'setup');
        return (
          <button
            key={tab.screen}
            onClick={() => dispatch({ type: 'NAVIGATE', payload: tab.screen })}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
              isActive ? 'text-ink' : 'text-subtle'
            }`}
          >
            <span className="text-lg leading-none">{tab.emoji}</span>
            <span className="text-[10px] font-medium tracking-[-0.01em]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
