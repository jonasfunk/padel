import { useState } from 'react';
import { usePlayers } from '../context/PlayersContext';
import { upsertPlayer, deletePlayer } from '../lib/playerRepository';
import { Avatar } from '../components/Avatar';
import { AvatarUpload } from '../components/AvatarUpload';
import type { PlayerProfile } from '../types';

function makeId() {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyProfile(): PlayerProfile {
  return {
    id: makeId(),
    name: '',
    avatarDataUrl: null,
    createdAt: Date.now(),
    stats: { tournamentsPlayed: 0, totalPoints: 0, totalMatchesPlayed: 0, totalMatchesWon: 0 },
    tournamentHistory: [],
  };
}

interface PlayerModalProps {
  initial: PlayerProfile;
  onSave: (p: PlayerProfile) => void;
  onClose: () => void;
}

function PlayerModal({ initial, onSave, onClose }: PlayerModalProps) {
  const [profile, setProfile] = useState(initial);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-canvas rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 space-y-5 shadow-modal">
        <h2 className="text-lg font-semibold tracking-[-0.03em] text-ink">
          {initial.name ? 'Rediger spiller' : 'Ny spiller'}
        </h2>

        <div className="flex items-center gap-4">
          <AvatarUpload
            currentDataUrl={profile.avatarDataUrl}
            name={profile.name || 'Spiller'}
            onUpload={(dataUrl) => setProfile((p) => ({ ...p, avatarDataUrl: dataUrl }))}
          />
          <input
            type="text"
            placeholder="Navn"
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            className="flex-1 rounded-lg border border-hairline bg-canvas text-ink px-3 py-2.5 text-sm font-medium placeholder:text-subtle focus:border-ink outline-none transition-colors"
            autoFocus
          />
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-hairline text-sm font-medium text-ink active:opacity-70"
          >
            Annuller
          </button>
          <button
            disabled={!profile.name.trim()}
            onClick={() => onSave(profile)}
            className="flex-1 py-2.5 rounded-full bg-primary text-on-primary text-sm font-medium disabled:opacity-30 active:opacity-70"
          >
            Gem
          </button>
        </div>
      </div>
    </div>
  );
}

export function PlayersScreen() {
  const { state } = usePlayers();
  const [modal, setModal] = useState<PlayerProfile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function handleSave(profile: PlayerProfile) {
    await upsertPlayer({ ...profile, name: profile.name.trim() });
    setModal(null);
  }

  async function handleDelete(id: string) {
    await deletePlayer(id);
    setConfirmDelete(null);
  }

  return (
    <div className="flex flex-col h-full bg-canvas-soft">
      <div className="px-4 pt-12 pb-4 bg-canvas border-b border-hairline">
        <h1 className="text-2xl font-semibold tracking-[-0.04em] text-ink">Spillere</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {state.loading ? (
          <p className="text-sm text-mute py-10 text-center">Henter spillere…</p>
        ) : state.players.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-mute">
            <span className="text-4xl">👥</span>
            <p className="text-sm">Ingen spillere endnu</p>
          </div>
        ) : (
          <ul className="px-4 pt-4 space-y-2">
            {state.players.map((player) => (
              <li key={player.id} className="flex items-center gap-3 bg-canvas rounded-xl p-3 border border-hairline shadow-card">
                <Avatar dataUrl={player.avatarDataUrl} name={player.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium tracking-[-0.01em] text-ink truncate">{player.name}</p>
                  <p className="text-xs text-mute">
                    {player.stats.tournamentsPlayed} turnering{player.stats.tournamentsPlayed !== 1 ? 'er' : ''}
                  </p>
                </div>
                <button onClick={() => setModal(player)} className="p-2 text-subtle hover:text-ink transition-colors">✎</button>
                <button onClick={() => setConfirmDelete(player.id)} className="p-2 text-faint hover:text-error transition-colors">✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fixed bottom-20 right-4">
        <button
          onClick={() => setModal(emptyProfile())}
          className="w-12 h-12 rounded-full bg-primary text-on-primary text-xl shadow-float flex items-center justify-center active:opacity-80"
        >
          +
        </button>
      </div>

      {modal && <PlayerModal initial={modal} onSave={handleSave} onClose={() => setModal(null)} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-canvas rounded-2xl p-6 w-full max-w-xs space-y-4 shadow-modal">
            <p className="text-base font-semibold tracking-[-0.02em] text-ink">Slet spiller?</p>
            <p className="text-sm text-mute">Spillerens turneringshistorik slettes.</p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-full border border-hairline text-sm font-medium text-ink active:opacity-70"
              >
                Annuller
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-full border border-error/30 text-sm font-medium text-error active:opacity-70"
              >
                Slet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
