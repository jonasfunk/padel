import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  arrayUnion,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { PlayerProfile, PlayerTournamentResult } from '../types';

const col = () => collection(db, 'players');

export function subscribeToPlayers(
  onUpdate: (players: PlayerProfile[]) => void
): Unsubscribe {
  return onSnapshot(col(), (snap) => {
    const players = snap.docs.map((d) => d.data() as PlayerProfile);
    players.sort((a, b) => a.createdAt - b.createdAt);
    onUpdate(players);
  });
}

export async function upsertPlayer(player: PlayerProfile): Promise<void> {
  await setDoc(doc(db, 'players', player.id), player);
}

export async function deletePlayer(id: string): Promise<void> {
  await deleteDoc(doc(db, 'players', id));
}

export async function updatePlayerStats(
  results: PlayerTournamentResult[]
): Promise<void> {
  await Promise.all(
    results.map((r) =>
      updateDoc(doc(db, 'players', r.playerId), {
        'stats.tournamentsPlayed': increment(1),
        'stats.totalPoints': increment(r.points),
        'stats.totalMatchesPlayed': increment(r.matchesPlayed),
        'stats.totalMatchesWon': increment(r.matchesWon),
        tournamentHistory: arrayUnion({
          tournamentId: r.tournamentId,
          date: r.date,
          points: r.points,
          matchesPlayed: r.matchesPlayed,
          matchesWon: r.matchesWon,
        }),
      })
    )
  );
}
