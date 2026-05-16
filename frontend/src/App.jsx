import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:3001';

function Home(){
  const [driveProgress, setDriveProgress] = useState(0);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleWheel = (event) => {
      event.preventDefault();
      setDriveProgress((previous) => {
        const next = previous + (event.deltaY * 0.06);
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

function LoginFailed(){
  return(
    <main className="page">
      <section className="card">
        <h1>Login Failed</h1>
        <p>
          Use a valid UCLA email address to successfully sign-up. 
        </p>
        
        <a className="button secondary" href="/">
          Back to home
        </a>
      </section>
    </main>
  );
}

function Dashboard(){
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
    }).then(async(res) => {
      if(!res.ok){
        throw new Error('Not authenticated');
      }
      const data = await res.json();
      setUser(data);
      setStatus('Authenticated');
    }).catch(() => {
      setStatus('Unauthenticated');
    });
  }, []);

  async function handleLogout(){
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/';
  }

  if(status === 'loading'){
    return(
      <main className="page">
        <section className="card">
          <p>Loading dashboard</p>
        </section>
      </main>
    );
  }

  if (status === 'Unauthenticated') {
    return (
      <main className="page">
        <section className="card">
          <h1>Not logged in</h1>

          <p>You need to log in before viewing the dashboard.</p>

          <a className="button" href={`${API_URL}/auth/google`}>
            Log in with Google
          </a>
        </section>
      </main>
    );
  }

  return(
    <main className="page">
      <section className="card">
        <h1>Dashbaord</h1>

        <p>Welcome: {user?.name || 'User'}</p>
        <p>Email: {user?.email || 'No email found'}</p>

        <hr />
        <h2>Permit Status:</h2>
        <p>Permit Verification coming soon :P</p>
        
        <button className="button secondary" onClick={handleLogout}>
          Log Out
        </button>
      </section>
    </main>
  );
}

function App(){
  const path = window.location.pathname;

  if(path === '/dashboard'){
    return <Dashboard />;
  }
  
  if(path === '/login-failed'){
    return <LoginFailed />
  }

  return <Home />
}

export default App;

