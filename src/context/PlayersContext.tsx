import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import { playersReducer, initialPlayersState, type PlayersState, type PlayersAction } from './playersReducer';
import { subscribeToPlayers } from '../lib/playerRepository';

interface PlayersContextValue {
  state: PlayersState;
  dispatch: React.Dispatch<PlayersAction>;
}

const PlayersContext = createContext<PlayersContextValue | null>(null);

export function PlayersProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playersReducer, initialPlayersState);

  useEffect(() => {
    const unsub = subscribeToPlayers((players) => {
      dispatch({ type: 'SET_PLAYERS', payload: players });
    });
    return unsub;
  }, []);

  return (
    <PlayersContext.Provider value={{ state, dispatch }}>
      {children}
    </PlayersContext.Provider>
  );
}

export function usePlayers() {
  const ctx = useContext(PlayersContext);
  if (!ctx) throw new Error('usePlayers must be used within PlayersProvider');
  return ctx;
}
