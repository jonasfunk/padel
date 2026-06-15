import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Tournament, MatchScore } from '../types';

export function subscribeToTournament(
  id: string,
  onUpdate: (t: Tournament) => void,
  onNotFound: () => void
): Unsubscribe {
  return onSnapshot(doc(db, 'tournaments', id), (snap) => {
    if (!snap.exists()) {
      onNotFound();
    } else {
      onUpdate(snap.data() as Tournament);
    }
  });
}

export async function saveTournament(tournament: Tournament): Promise<void> {
  await setDoc(doc(db, 'tournaments', tournament.id), tournament);
}

export async function updateMatchScore(
  tournament: Tournament,
  matchId: string,
  score: MatchScore
): Promise<void> {
  const updated: Tournament = {
    ...tournament,
    rounds: tournament.rounds.map((round) => ({
      ...round,
      matches: round.matches.map((m) =>
        m.id === matchId
          ? { ...m, score, status: 'completed' as const }
          : m
      ),
    })),
  };

  const allDone = updated.rounds.every((r) =>
    r.matches.every((m) => m.status === 'completed')
  );
  if (allDone) updated.status = 'finished';

  await setDoc(doc(db, 'tournaments', updated.id), updated);
}

export async function deleteTournament(id: string): Promise<void> {
  await deleteDoc(doc(db, 'tournaments', id));
}
