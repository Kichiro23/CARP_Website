import { useEffect, useState } from 'react';

export default function VideoBackground({ opacity = 0.5 }: { opacity?: number }) {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.getAttribute('data-theme') === 'light');
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {isLight ? (
        /* Light mode: soft white sky gradient with subtle cloud video */
        <>
          <video
            autoPlay loop muted playsInline
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: 0.25, filter: 'brightness(2.2) contrast(0.7) saturate(0.5)' }}
          >
            <source src="/videos/clouds.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f5f7fa 40%, #eef1f5 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(234,157,99,0.04) 0%, transparent 60%)' }} />
        </>
      ) : (
        /* Dark mode: original dark clouds */
        <>
          <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover" style={{ opacity }}>
            <source src="/videos/clouds.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(19,19,31,0.7) 0%, rgba(19,19,31,0.5) 40%, rgba(19,19,31,0.75) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(234,157,99,0.06) 0%, transparent 60%)' }} />
        </>
      )}
    </div>
  );
}
