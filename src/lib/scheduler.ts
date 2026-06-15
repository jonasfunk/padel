import type { Player, Round, Match, PlayerId } from '../types';

const PHANTOM = '__bye__';

function rotateRing(ring: PlayerId[]): PlayerId[] {
  // Fix element at index 0, rotate the rest one step right
  if (ring.length <= 1) return ring;
  const fixed = ring[0];
  const tail = ring.slice(1);
  return [fixed, tail[tail.length - 1], ...tail.slice(0, tail.length - 1)];
}

function buildRound(
  ring: PlayerId[],
  roundIndex: number,
  courtCount: number
): { matches: Match[]; byePlayers: PlayerId[] } {
  const n = ring.length;
  // Pair by mirroring: pair i = (ring[i], ring[n-1-i])
  const pairs: [PlayerId, PlayerId][] = [];
  for (let i = 0; i < n / 2; i++) {
    pairs.push([ring[i], ring[n - 1 - i]]);
  }

  const matches: Match[] = [];
  const byePlayers: PlayerId[] = [];
  let matchIndex = 0;

  // Group pairs into 4-player matches (2 pairs per match)
  for (let i = 0; i + 1 < pairs.length; i += 2) {
    const [a, b] = pairs[i];
    const [c, d] = pairs[i + 1];

    // Check if any slot is a phantom (bye)
    const hasPhantom = [a, b, c, d].some((p) => p === PHANTOM);
    if (hasPhantom) {
      // Real players in this group sit out
      [a, b, c, d].forEach((p) => {
        if (p !== PHANTOM) byePlayers.push(p);
      });
      continue;
    }

    if (matches.length >= courtCount) {
      // Exceeds available courts — all 4 players sit out this round
      [a, b, c, d].forEach((p) => byePlayers.push(p));
      continue;
    }

    matches.push({
      id: `r${roundIndex}-m${matchIndex}`,
      roundIndex,
      matchIndex,
      court: matchIndex + 1,
      team1: [a, b],
      team2: [c, d],
      score: null,
      status: 'pending',
    });
    matchIndex++;
  }

  // Handle leftover pair (odd number of pairs)
  const leftoverStart = Math.floor(pairs.length / 2) * 2;
  if (leftoverStart < pairs.length) {
    const [a, b] = pairs[leftoverStart];
    if (a !== PHANTOM) byePlayers.push(a);
    if (b !== PHANTOM) byePlayers.push(b);
  }

  return { matches, byePlayers };
}

export function generateSchedule(
  players: Player[],
  courtCount: number
): Round[] {
  const n = players.length;

  // Pad to even number with phantom if needed
  const ids = players.map((p) => p.id);
  if (n % 2 === 1) ids.push(PHANTOM);

  const effectiveN = ids.length;
  const totalRounds = effectiveN - 1;
  const rounds: Round[] = [];

  let ring = [...ids];

  for (let r = 0; r < totalRounds; r++) {
    const { matches, byePlayers } = buildRound(ring, r, courtCount);
    rounds.push({ index: r, matches, byePlayers });
    ring = rotateRing(ring);
  }

  return rounds;
}
