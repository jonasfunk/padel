import { useRef } from 'react';
import { Avatar } from './Avatar';
import { resizeImageToDataUrl } from '../lib/imageUtils';

interface AvatarUploadProps {
  currentDataUrl: string | null;
  name: string;
  onUpload: (dataUrl: string) => void;
}

export function AvatarUpload({ currentDataUrl, name, onUpload }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      onUpload(dataUrl);
    } catch {
      // ignore
    }
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="relative flex-shrink-0"
      aria-label="Upload billede"
    >
      <Avatar dataUrl={currentDataUrl} name={name} size="lg" />
      <span className="absolute bottom-0 right-0 bg-primary text-on-primary rounded-full w-6 h-6 flex items-center justify-center text-xs leading-none shadow-card">
        ✎
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </button>
  );
}
