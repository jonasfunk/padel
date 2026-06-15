interface AvatarProps {
  dataUrl: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-20 h-20 text-xl',
};

export function Avatar({ dataUrl, name, size = 'md' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${sizeMap[size]} rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-medium bg-canvas-2 text-subtle`}
    >
      {dataUrl ? (
        <img src={dataUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials || '?'
      )}
    </div>
  );
}
