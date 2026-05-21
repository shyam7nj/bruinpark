import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3001';

function Home() {
  const [driveProgress, setDriveProgress] = useState(0);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleWheel = (event) => {
      event.preventDefault();

      setDriveProgress((previous) => {
        const next = previous + event.deltaY * 0.06;
        return Math.max(0, Math.min(100, next));
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const sceneStyle = {
    '--drive-progress': driveProgress,
    '--drive-ratio': driveProgress / 100,
  };

  return (
    <main className="landing-page" style={sceneStyle}>
      <section className="hero-card">
        <p className="eyebrow">BRUINPARK</p>

        <h1>Find Your Perfect Parking Match</h1>

        <p className="hero-copy">
          Scroll your wheel to drive through campus and preview a faster, simpler
          way to coordinate permits with fellow commuters.
        </p>

        <a className="button" href={`${API_URL}/auth/google`}>
          Log in with Google
        </a>

        <p className="credit">Built by Shyam, Hastin, Jiahao, and Tianyi</p>
      </section>

      <div className="mountains" aria-hidden="true" />

      <div className="road" aria-hidden="true">
        <div className="road-lines" />
      </div>

      <div className="car" aria-hidden="true">
        <div className="car-body" />
        <div className="wheel wheel-left" />
        <div className="wheel wheel-right" />
      </div>

      <div className="scroll-meter" aria-hidden="true">
        <span>Drive Progress</span>

        <div className="meter-track">
          <div className="meter-fill" />
        </div>
      </div>
    </main>
  );
}

export default Home;