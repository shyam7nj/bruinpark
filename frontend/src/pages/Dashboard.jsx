import { useEffect, useState } from 'react';
import PageLayout from '../components/PageLayout';

const API_URL = 'http://localhost:3001';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Not authenticated');
        }

        const data = await res.json();
        setUser(data);
        setStatus('authenticated');
      })
      .catch(() => {
        setStatus('unauthenticated');
      });
  }, []);

  async function handleLogout() {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    window.location.href = '/';
  }

  if (status === 'loading') {
    return (
      <PageLayout>
        <p>Loading dashboard...</p>
      </PageLayout>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <PageLayout>
        <h1>Not logged in</h1>

        <p>You need to log in before viewing the dashboard.</p>

        <a className="button" href={`${API_URL}/auth/google`}>
          Log in with Google
        </a>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <h1>Dashboard</h1>

      <p>Welcome: {user?.name || 'User'}</p>
      <p>Email: {user?.email || 'No email found'}</p>

      <hr />

      <h2>Permit Status</h2>
      <p>Permit verification coming soon.</p>

      <a className="button" href="/create-post">
        Create Parking Post
      </a>

      <a className="button" href="/browse-posts">
        Browse Parking Posts
      </a>

      <button className="button secondary" onClick={handleLogout}>
        Log Out
      </button>
    </PageLayout>
  );
}

export default Dashboard;