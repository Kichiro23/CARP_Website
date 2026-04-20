export default function VideoBackground({ opacity = 0.5 }: { opacity?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover" style={{ opacity }}>
        <source src="./videos/clouds.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(19,19,31,0.7) 0%, rgba(19,19,31,0.5) 40%, rgba(19,19,31,0.75) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(234,157,99,0.06) 0%, transparent 60%)' }} />
    </div>
  );
}
