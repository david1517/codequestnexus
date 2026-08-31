export function ScanlineOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <div
        className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-neon-blue/5 to-transparent"
        style={{ animation: 'scanline 8s linear infinite' }}
      />
    </div>
  );
}
