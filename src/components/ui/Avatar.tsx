import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
  ringColor?: 'blue' | 'purple' | 'green' | 'gold' | 'pink';
  className?: string;
}

const sizeMap = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

const ringColorMap = {
  blue: 'shadow-neon-blue',
  purple: 'shadow-neon-purple',
  green: 'shadow-neon-green',
  gold: 'shadow-neon-gold',
  pink: 'shadow-neon-pink',
};

export function Avatar({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  ring = false,
  ringColor = 'blue',
  className,
}: AvatarProps) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden',
        'bg-gradient-to-br from-neon-blue to-neon-purple',
        'font-display font-bold text-white',
        ring && `ring-2 ring-neon-${ringColor} ${ringColorMap[ringColor]}`,
        sizeMap[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span>{fallback || alt.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}
