import { useTheme, type Theme } from '../hooks/useTheme';

const icon: Record<Theme, string> = {
  system: '⊙',
  light: '☀',
  dark: '☽',
};

const label: Record<Theme, string> = {
  system: 'Auto',
  light: 'Lys',
  dark: 'Mørk',
};

export function ThemeToggle() {
  const { theme, cycle } = useTheme();

  return (
    <button
      onClick={cycle}
      aria-label={`Tema: ${label[theme]}`}
      title={`Skift tema (nu: ${label[theme]})`}
      className="fixed top-3 right-4 z-50 w-9 h-9 rounded-full border border-hairline bg-canvas text-ink shadow-card flex items-center justify-center text-base transition-opacity active:opacity-60"
    >
      {icon[theme]}
    </button>
  );
}
