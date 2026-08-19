import { cn } from '@/lib/utils';

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p';
}

export function GlitchText({ text, className, as: Component = 'span' }: GlitchTextProps) {
  return (
    <Component
      className={cn('relative inline-block font-display font-black', className)}
      data-text={text}
    >
      <span className="relative z-10">{text}</span>
      <span
        className="absolute inset-0 -z-10 text-neon-pink opacity-70"
        style={{ transform: 'translate(-2px, 0)' }}
        aria-hidden="true"
      >
        {text}
      </span>
      <span
        className="absolute inset-0 -z-10 text-neon-blue opacity-70"
        style={{ transform: 'translate(2px, 0)' }}
        aria-hidden="true"
      >
        {text}
      </span>
    </Component>
  );
}
