import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001';

function Step({ number, children, done }) {
  return (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
      <span style={{
        minWidth: '30px', height: '30px', borderRadius: '50%',
        background: done ? '#16a34a' : '#2774ae', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '700', fontSize: '14px', flexShrink: 0,
        transition: 'background 0.3s ease',
      }}>
        {done ? '✓' : number}
      </span>
      <p style={{ margin: 0, paddingTop: '5px', color: '#374151', fontSize: '15px', lineHeight: '1.6' }}>
        {children}
      </p>
    </div>
  );
}

function Verify() {
  const [user, setUser] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [sendStatus, setSendStatus] = useState('idle');   // idle | sending | sent | error
  const [checkStatus, setCheckStatus] = useState('idle'); // idle | checking | success | failed
  const [sendMessage, setSendMessage] = useState('');
  const [checkMessage, setCheckMessage] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminStatus, setAdminStatus] = useState('idle'); // idle | loading | error | success

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) { window.location.href = '/'; return; }
        if (data.isVerified) { window.location.href = '/dashboard'; return; }
        setUser(data);
      })
      .catch(() => { window.location.href = '/'; });
  }, []);

  async function handleSendEmail() {
    setSendStatus('sending');
    setSendMessage('');

    try {
      const res = await fetch(`${API_URL}/api/verify/request`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        setSendStatus('sent');
        setSendMessage(data.message);
        setEmailSent(true);
      } else {
        setSendStatus('error');
        setSendMessage(data.error || 'Failed to send email.');
      }
    } catch {
      setSendStatus('error');
      setSendMessage('Network error. Please try again.');
    }
  }

  async function handleCheck() {
    setCheckStatus('checking');
    setCheckMessage('');

    try {
      const res = await fetch(`${API_URL}/api/verify/check`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();

      if (data.isVerified) {
        setCheckStatus('success');
        setCheckMessage(data.message);
        // Re-fetch to confirm DB update is live before redirecting
        setTimeout(async () => {
          const confirm = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
          const confirmData = await confirm.json();
          if (confirmData.isVerified) {
            window.location.href = '/dashboard';
          } else {
            // DB not updated yet, wait a bit more
            setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
          }
        }, 1500);
      } else {
        setCheckStatus('failed');
        setCheckMessage(data.message || data.error || 'Verification failed.');
      }
    } catch {
      setCheckStatus('failed');
      setCheckMessage('Network error. Please try again.');
    }
  }

  async function handleAdminBypass() {
    setAdminStatus('loading');
    try {
      const res = await fetch(`${API_URL}/api/verify/admin-bypass`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdminStatus('success');
        setTimeout(() => { window.location.href = '/dashboard'; }, 1200);
      } else {
        setAdminStatus('error');
      }
    } catch {
      setAdminStatus('error');
    }
  }

  if (!user) {
    return (
      <main className="dashboard-page page-enter">
        <div className="dashboard-card"><p>Loading...</p></div>
      </main>
    );
  }

  return (
    <main className="dashboard-page page-enter">
      <div style={{
        width: '100%', maxWidth: '600px', padding: '40px',
        background: '#ffd100', borderRadius: '24px',
        boxShadow: '0 18px 45px rgba(15,23,42,0.12)',
      }}>
        <h1 style={{ margin: '0 0 6px', color: '#2774ae', fontSize: '36px' }}>
          Permit Verification
        </h1>
        <p style={{ margin: '0 0 28px', color: '#4b5563', fontSize: '15px' }}>
          Verify your UCLA parking permit once to unlock posting on BruinPark.
        </p>

        {/* Step-by-step instructions */}
        <div style={{
          background: 'white', borderRadius: '14px', padding: '24px',
          marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '18px',
        }}>
          <Step number={1} done={emailSent}>
            Click <strong>"Send Verification Email"</strong> below. BruinPark will email
            instructions and a unique code to <strong>{user.email}</strong>.
          </Step>

          <Step number={2} done={emailSent}>
            Open your UCLA email and find the message from BruinPark.
            Then find your permit confirmation from{' '}
            <strong>DoNotReply@ts.ucla.edu</strong> and forward it to{' '}
            <strong style={{ color: '#2774ae' }}>bruinparkverify@gmail.com</strong>.
            Make sure the subject line still contains your verification code.
          </Step>

          <Step number={3} done={checkStatus === 'success'}>
            Come back here and click <strong>"Check Verification"</strong>.
            BruinPark will confirm your forwarded email automatically.
          </Step>
        </div>

        {/* Send email button */}
        {!emailSent ? (
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={handleSendEmail}
              disabled={sendStatus === 'sending'}
              style={{
                width: '100%', padding: '14px',
                background: '#2774ae', color: 'white',
                border: 'none', borderRadius: '10px',
                fontWeight: '700', fontSize: '16px',
                cursor: sendStatus === 'sending' ? 'not-allowed' : 'pointer',
                opacity: sendStatus === 'sending' ? 0.65 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              {sendStatus === 'sending' ? 'Sending…' : 'Send Verification Email'}
            </button>
            {sendStatus === 'error' && (
              <p style={{ color: '#ef4444', fontWeight: '700', marginTop: '10px', textAlign: 'center' }}>
                {sendMessage}
              </p>
            )}
          </div>
        ) : (
          <div style={{
            background: '#f0fdf4', border: '2px solid #16a34a',
            borderRadius: '12px', padding: '14px', marginBottom: '16px',
          }}>
            <p style={{ color: '#16a34a', fontWeight: '700', margin: '0 0 4px' }}>
              ✓ Verification email sent
            </p>
            <p style={{ color: '#166534', margin: 0, fontSize: '14px' }}>{sendMessage}</p>
          </div>
        )}

        {/* Check verification button — only shown after email is sent */}
        {emailSent && (
          <div>
            {checkStatus === 'success' ? (
              <div style={{
                background: '#f0fdf4', border: '2px solid #16a34a',
                borderRadius: '12px', padding: '16px', marginBottom: '16px',
              }}>
                <p style={{ color: '#16a34a', fontWeight: '700', margin: '0 0 4px' }}>
                  ✓ Permit Verified!
                </p>
                <p style={{ color: '#166534', margin: 0, fontSize: '14px' }}>
                  {checkMessage} Redirecting to your dashboard…
                </p>
              </div>
            ) : (
              <>
                {checkStatus === 'failed' && (
                  <div style={{
                    background: '#fef2f2', border: '2px solid #ef4444',
                    borderRadius: '12px', padding: '14px', marginBottom: '14px',
                  }}>
                    <p style={{ color: '#ef4444', fontWeight: '700', margin: '0 0 4px' }}>
                      ✗ Not found yet
                    </p>
                    <p style={{ color: '#7f1d1d', margin: 0, fontSize: '14px' }}>{checkMessage}</p>
                  </div>
                )}

                <button
                  onClick={handleCheck}
                  disabled={checkStatus === 'checking'}
                  style={{
                    width: '100%', padding: '14px',
                    background: '#172033', color: 'white',
                    border: 'none', borderRadius: '10px',
                    fontWeight: '700', fontSize: '16px',
                    cursor: checkStatus === 'checking' ? 'not-allowed' : 'pointer',
                    opacity: checkStatus === 'checking' ? 0.65 : 1,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  {checkStatus === 'checking' ? 'Checking your email…' : 'Check Verification'}
                </button>

                <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
                  Just forwarded? Emails can take 30–60 seconds to arrive. Wait a moment then try again.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Admin bypass — fixed bottom right corner */}
      <button
        onClick={() => { setAdminOpen(true); setAdminStatus('idle'); setAdminPassword(''); }}
        style={{
          position: 'fixed', bottom: '20px', right: '24px',
          background: 'none', border: 'none',
          color: '#9ca3af', fontSize: '12px',
          cursor: 'pointer', textDecoration: 'underline',
          padding: '4px',
        }}
      >
        Admin bypass
      </button>

      {/* Admin password modal */}
      {adminOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '380px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
            animation: 'fadeSlideIn 0.2s cubic-bezier(0.22,1,0.36,1) both',
          }}>
            <h2 style={{ margin: '0 0 8px', color: '#172033', fontSize: '20px' }}>
              Admin Verification Bypass
            </h2>
            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '14px' }}>
              Enter the admin password to instantly grant verification.
            </p>

            <input
              type="password"
              value={adminPassword}
              onChange={(e) => { setAdminPassword(e.target.value); setAdminStatus('idle'); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdminBypass(); }}
              placeholder="Admin password"
              autoFocus
              style={{
                width: '100%', padding: '10px 14px',
                border: '2px solid #d1d5db', borderRadius: '8px',
                font: 'inherit', fontSize: '15px',
                outline: 'none', marginBottom: '12px',
                boxSizing: 'border-box',
              }}
            />

            {adminStatus === 'error' && (
              <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 12px', fontWeight: '700' }}>
                Incorrect password. Try again.
              </p>
            )}

            {adminStatus === 'success' && (
              <p style={{ color: '#16a34a', fontSize: '13px', margin: '0 0 12px', fontWeight: '700' }}>
                ✓ Verified! Redirecting…
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setAdminOpen(false)}
                style={{
                  padding: '10px 18px', background: 'white',
                  border: '2px solid #d1d5db', borderRadius: '8px',
                  fontWeight: '700', cursor: 'pointer', color: '#374151',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdminBypass}
                disabled={adminStatus === 'loading' || adminStatus === 'success'}
                style={{
                  padding: '10px 18px', background: '#2774ae',
                  color: 'white', border: 'none', borderRadius: '8px',
                  fontWeight: '700',
                  cursor: adminStatus === 'loading' || adminStatus === 'success'
                    ? 'not-allowed' : 'pointer',
                  opacity: adminStatus === 'loading' || adminStatus === 'success' ? 0.65 : 1,
                }}
              >
                {adminStatus === 'loading' ? 'Verifying…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Verify;