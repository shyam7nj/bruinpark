import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3001';

// Shared style for all dashboard action buttons so they are identical in size
const btnStyle = {
  display: 'inline-block',
  padding: '12px 18px',
  borderRadius: '8px',
  fontWeight: '700',
  fontSize: '14px',
  textDecoration: 'none',
  minWidth: '160px',
  textAlign: 'center',
};

const activeBtnStyle = {
  ...btnStyle,
  background: '#2774ae',
  color: 'white',
  cursor: 'pointer',
};

const disabledBtnStyle = {
  ...btnStyle,
  background: '#d1d5db',
  color: '#9ca3af',
  cursor: 'not-allowed',
  userSelect: 'none',
};

function Dashboard() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('Loading');
  const [unverifyStatus, setUnverifyStatus] = useState('idle');
  const [showChoice, setShowChoice] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Not Logged In');
        const data = await res.json();
        setUser(data);
        setStatus('Authenticated');
        if (!data.isVerified) setShowChoice(true);
      })
      .catch(() => setStatus('Unauthenticated'));
  }, []);

  async function logout() {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = '/';
  }

  async function handleUnverify() {
    setUnverifyStatus('loading');
    try {
      const res = await fetch(`${API_URL}/api/verify/unverify`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev) => ({ ...prev, isVerified: false }));
        setUnverifyStatus('idle');
        setShowChoice(true);
      } else {
        console.error('Unverify failed:', data);
        setUnverifyStatus('error');
      }
    } catch (err) {
      console.error('Unverify network error:', err);
      setUnverifyStatus('error');
    }
  }

  if (status === 'Loading') {
    return (
      <main className="dashboard-page page-enter">
        <div className="dashboard-card"><p>Loading Dashboard, hang tight...</p></div>
      </main>
    );
  }

  if (status === 'Unauthenticated') {
    return (
      <main className="dashboard-page page-enter">
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

  // Choice screen — shown to unverified users before they see the dashboard
  if (!user.isVerified && showChoice) {
    return (
      <main className="dashboard-page page-enter">
        <div className="dashboard-card">
          <h1>Welcome, {user.name.split(' ')[0]}!</h1>
          <p style={{ color: '#4b5563' }}>
            BruinPark requires a verified UCLA parking permit to access most features.
            Would you like to verify now, or skip and look around first?
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
            <a
              href="/verify"
              style={{
                ...activeBtnStyle,
                background: '#2774ae',
                color: 'white',
                padding: '14px 28px',
              }}
            >
              Verify Permit Now
            </a>
            <button
              onClick={() => setShowChoice(false)}
              style={{
                ...btnStyle,
                background: 'white',
                color: '#2774ae',
                border: '2px solid #2774ae',
                padding: '14px 28px',
                cursor: 'pointer',
              }}
            >
              Skip for Now
            </button>
          </div>

          <p style={{ marginTop: '16px', fontSize: '13px', color: '#9ca3af' }}>
            You can verify at any time from your dashboard.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page page-enter">
      <div className="dashboard-card">
        <h1>Dashboard</h1>
        <p>Welcome, <strong>{user.name}</strong>.</p>
        <p style={{ fontSize: '16px', color: '#4b5563' }}>{user.email}</p>

        {/* Verification status badge */}
        <div style={{ margin: '4px 0 24px' }}>
          {user.isVerified ? (
            <div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', background: '#f0fdf4',
                border: '2px solid #16a34a', borderRadius: '999px',
                color: '#16a34a', fontWeight: '700', fontSize: '14px',
              }}>
                ✓ Permit Verified
              </span>
              <div style={{ marginTop: '10px' }}>
                <button
                  onClick={handleUnverify}
                  disabled={unverifyStatus === 'loading'}
                  style={{
                    padding: '6px 14px', background: 'white',
                    border: '2px solid #ef4444', borderRadius: '999px',
                    color: '#ef4444', fontWeight: '700', fontSize: '13px',
                    cursor: unverifyStatus === 'loading' ? 'not-allowed' : 'pointer',
                    opacity: unverifyStatus === 'loading' ? 0.6 : 1,
                  }}
                >
                  {unverifyStatus === 'loading' ? 'Removing...' : 'Remove Verification'}
                </button>
                {unverifyStatus === 'error' && (
                  <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>
                    Failed to remove verification. Please try again.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', background: '#fef2f2',
              border: '2px solid #ef4444', borderRadius: '999px',
              color: '#ef4444', fontWeight: '700', fontSize: '14px',
            }}>
              ✗ Not Verified
            </span>
          )}
        </div>

        {/* Action buttons — grayed out for unverified users */}
        <div className="dashboard-buttons">
          {user.isVerified ? (
            <a href="/create-post" style={{ ...activeBtnStyle }}>
              Create Parking Post
            </a>
          ) : (
            <span style={disabledBtnStyle}>Create Parking Post</span>
          )}

          {user.isVerified ? (
            <a href="/my-posts" style={{ ...activeBtnStyle }}>
              My Posts
            </a>
          ) : (
            <span style={disabledBtnStyle}>My Posts</span>
          )}

          {user.isVerified ? (
            <a href="/browse-posts" style={{ ...activeBtnStyle }}>
              Browse Parking Posts
            </a>
          ) : (
            <span style={disabledBtnStyle}>Browse Parking Posts</span>
          )}

          {!user.isVerified && (
            <a href="/verify" style={{ ...activeBtnStyle, background: '#ef4444' }}>
              Verify Permit
            </a>
          )}
        </div>

        <button className="dashboard-logout-button" onClick={logout} style={{ marginTop: '24px' }}>
          Log Out
        </button>
      </div>
    </main>
  );
}

export default Dashboard;