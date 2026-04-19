/**
 * Multi-layer animated cloud background
 * GPU-accelerated CSS transforms for smooth 60fps animation
 * 3 parallax layers with different speeds and opacities
 */

interface Cloud {
  id: number;
  layer: 1 | 2 | 3;
  width: number;
  height: number;
  top: string;
  duration: number;
  delay: number;
  opacity: number;
  direction: 'left' | 'right';
}

function generateClouds(): Cloud[] {
  const clouds: Cloud[] = [];
  let id = 0;

  // Layer 1: Background — slow, large, very transparent
  for (let i = 0; i < 5; i++) {
    clouds.push({
      id: id++,
      layer: 1,
      width: 350 + Math.random() * 300,
      height: 100 + Math.random() * 60,
      top: `${Math.random() * 60}%`,
      duration: 50 + Math.random() * 30,
      delay: Math.random() * -50,
      opacity: 0.06 + Math.random() * 0.05,
      direction: i % 2 === 0 ? 'left' : 'right',
    });
  }

  // Layer 2: Mid — medium speed, medium size, moderate opacity
  for (let i = 0; i < 6; i++) {
    clouds.push({
      id: id++,
      layer: 2,
      width: 250 + Math.random() * 200,
      height: 80 + Math.random() * 50,
      top: `${Math.random() * 70}%`,
      duration: 35 + Math.random() * 20,
      delay: Math.random() * -35,
      opacity: 0.1 + Math.random() * 0.08,
      direction: i % 2 === 0 ? 'right' : 'left',
    });
  }

  // Layer 3: Foreground — faster, smaller, more visible
  for (let i = 0; i < 4; i++) {
    clouds.push({
      id: id++,
      layer: 3,
      width: 180 + Math.random() * 150,
      height: 60 + Math.random() * 40,
      top: `${10 + Math.random() * 50}%`,
      duration: 22 + Math.random() * 15,
      delay: Math.random() * -22,
      opacity: 0.12 + Math.random() * 0.1,
      direction: i % 2 === 0 ? 'left' : 'right',
    });
  }

  return clouds;
}

const CLOUDS = generateClouds();

export default function CloudBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Sky gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #c9d8f0 0%, #dde8f7 25%, #e8f0fa 50%, #f0f4f8 75%, #f5f7fa 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 30%, rgba(234,157,99,0.08) 0%, transparent 50%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 80% 70%, rgba(162,183,199,0.1) 0%, transparent 50%)',
        }}
      />

      {/* Animated cloud layers */}
      {CLOUDS.map((cloud) => (
        <div
          key={cloud.id}
          className="cloud-layer"
          data-layer={cloud.layer}
          style={
            {
              '--cloud-width': `${cloud.width}px`,
              '--cloud-height': `${cloud.height}px`,
              '--cloud-top': cloud.top,
              '--cloud-duration': `${cloud.duration}s`,
              '--cloud-delay': `${cloud.delay}s`,
              '--cloud-opacity': cloud.opacity,
              '--cloud-direction': cloud.direction === 'left' ? '-1' : '1',
            } as React.CSSProperties
          }
        >
          <div className="cloud-shape" />
        </div>
      ))}
    </div>
  );
}
