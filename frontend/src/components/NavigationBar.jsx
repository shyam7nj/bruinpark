import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3001';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('Loading');

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Not Logged In');
        const data = await res.json();
        setUser(data);
        setStatus('Authenticated');
      })
      .catch(() => setStatus('Unauthenticated'));
  }, []);

  async function logout() {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = '/';
  }

  if (status === 'Loading') {
    return (
      <main className="dashboard-page">
        <div className="dashboard-card">
          <p>Loading Dashboard, hang tight...</p>
        </div>
      </main>
    );
  }

  if (status === 'Unauthenticated') {
    return (
      <main className="dashboard-page">
        <div className="dashboard-card">
          <h1>Not Logged In</h1>
          <p>You need to login with your UCLA Google account before viewing your dashboard.</p>
          <a className="home-login-button" href={`${API_URL}/auth/google`}>
            Log in with Google
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-card">
        <h1>Dashboard</h1>
        <p>Welcome to your Dashboard, {user.name}.</p>
        <p>Email: {user.email}</p>

        <div className="dashboard-buttons">
          <a className="home-login-button" href="/create-post">
            Create Parking Post
          </a>
          <a className="home-login-button" href="/my-posts">
            My Posts
          </a>
          <a className="home-login-button" href="/browse-posts">
            Browse Parking Posts
          </a>
        </div>

        <button className="dashboard-logout-button" onClick={logout}>
          Log Out
        </button>
      </div>
    </main>
  );
}

export default Dashboard;