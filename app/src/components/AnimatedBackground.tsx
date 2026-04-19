/**
 * Global animated background for all authenticated pages
 * Subtle floating orbs that slowly drift - lightweight GPU-accelerated
 */

const ORBS = [
  { id: 1, size: 300, x: '10%', y: '20%', color: 'rgba(234,157,99,0.04)', duration: 25, delay: 0 },
  { id: 2, size: 200, x: '70%', y: '10%', color: 'rgba(162,183,199,0.04)', duration: 30, delay: -10 },
  { id: 3, size: 250, x: '40%', y: '60%', color: 'rgba(234,157,99,0.03)', duration: 35, delay: -20 },
  { id: 4, size: 180, x: '85%', y: '70%', color: 'rgba(162,183,199,0.03)', duration: 28, delay: -5 },
  { id: 5, size: 150, x: '20%', y: '80%', color: 'rgba(234,157,99,0.025)', duration: 32, delay: -15 },
  { id: 6, size: 220, x: '60%', y: '30%', color: 'rgba(162,183,199,0.025)', duration: 27, delay: -8 },
];

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {ORBS.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            animation: `orbFloat ${orb.duration}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
}
