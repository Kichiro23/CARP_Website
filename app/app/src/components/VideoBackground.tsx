/**
 * Full-screen looping cloud video background for ALL pages
 * GPU-accelerated, lightweight, with dark overlay for readability
 */

interface Props {
  opacity?: number;
}

export default function VideoBackground({ opacity = 0.6 }: Props) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity }}
      >
        <source src="./videos/clouds.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay for readability */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(10,10,18,0.65) 0%, rgba(10,10,18,0.50) 40%, rgba(10,10,18,0.70) 100%)',
        }}
      />
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(234,157,99,0.06) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}
