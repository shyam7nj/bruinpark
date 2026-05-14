import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:3001';

function Home(){
  return (
    <main className="page">
      <section className="card">
        <h1>BruinPark</h1>
        <p>
          BruinPark helps commuter students save money by sharing parking permits by
          matching users with non-overlapping parking schedules.
        </p>

        <a className="button" href={`${API_URL}/auth/google`}>
          Log in with Google
        </a>
      </section>
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

