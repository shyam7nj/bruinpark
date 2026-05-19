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
        <h1>Dashboard</h1>

        <p>Welcome: {user?.name || 'User'}</p>
        <p>Email: {user?.email || 'No email found'}</p>

        <hr />
        <h2>Permit Status:</h2>
        <p>Permit Verification coming soon :P</p>
        
        <a className="button" href="/create-post">
         Create Parking Post
        </a>

        <a className="button" href="/browse-posts">
           Browse Parking Posts
        </a>
        
        <button className="button secondary" onClick={handleLogout}>
          Log Out
        </button>
      </section>
    </main>
  );
}

function CreatePost() {
  const [parkingStructure, setParkingStructure] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const defaultSchedule = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  };

  const [schedule, setSchedule] = useState(defaultSchedule);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const timeBlocks = ['morning', 'afternoon', 'evening'];

  function toggleTimeBlock(day, timeBlock) {
    setSchedule((currentSchedule) => {
      const currentBlocks = currentSchedule[day];
      const alreadySelected = currentBlocks.includes(timeBlock);

      return {
        ...currentSchedule,
        [day]: alreadySelected
          ? currentBlocks.filter((block) => block !== timeBlock)
          : [...currentBlocks, timeBlock],
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    const response = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parkingStructure,
        schedule,
        notes,
      }),
    });

    if (response.ok) {
      setMessage('Parking post created successfully!');
      setParkingStructure('');
      setNotes('');
      setSchedule(defaultSchedule);
    } else {
      const data = await response.json();
      setMessage(data.error || 'Failed to create parking post.');
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Create Parking Post</h1>

        <form className="post-form" onSubmit={handleSubmit}>
          <label>
            Parking Structure
            <select
              value={parkingStructure}
              onChange={(event) => setParkingStructure(event.target.value)}
            >
              <option value="">Select a structure</option>
              <option value="Structure 2">Structure 2</option>
              <option value="Structure 3">Structure 3</option>
              <option value="Structure 4">Structure 4</option>
              <option value="Structure 7">Structure 7</option>
              <option value="Structure 8">Structure 8</option>
            </select>
          </label>

          <h2>Schedule</h2>
          <p>Select the times you expect to need parking.</p>

          <div className="schedule-grid">
            {days.map((day) => (
              <div className="schedule-day" key={day}>
                <h3>{day}</h3>

                {timeBlocks.map((timeBlock) => (
                  <label key={timeBlock}>
                    <input
                      type="checkbox"
                      checked={schedule[day].includes(timeBlock)}
                      onChange={() => toggleTimeBlock(day, timeBlock)}
                    />
                    {timeBlock}
                  </label>
                ))}
              </div>
            ))}
          </div>

          <label>
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Example: I usually stay late Wednesday for club meetings."
            />
          </label>

          <button className="button" type="submit">
            Submit Post
          </button>
        </form>

        {message && <p>{message}</p>}

        <a className="button secondary" href="/dashboard">
          Back to dashboard
        </a>
      </section>
    </main>
  );
}

function BrowsePosts() {
  const [posts, setPosts] = useState([]);
  const [parkingStructure, setParkingStructure] = useState('');
  const [message, setMessage] = useState('');

  async function fetchPosts(selectedStructure = '') {
    setMessage('');

    const query = selectedStructure
      ? `?parkingStructure=${encodeURIComponent(selectedStructure)}`
      : '';

    const response = await fetch(`${API_URL}/api/posts${query}`, {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      setPosts(data);
    } else {
      const errorData = await response.json();
      setMessage(errorData.error || 'Failed to load posts.');
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  function handleFilterChange(event) {
    const selectedStructure = event.target.value;
    setParkingStructure(selectedStructure);
    fetchPosts(selectedStructure);
  }

  return (
    <main className="page">
      <section className="card wide-card">
        <h1>Browse Parking Posts</h1>

        <label>
          Filter by parking structure
          <select value={parkingStructure} onChange={handleFilterChange}>
            <option value="">All structures</option>
            <option value="Structure 2">Structure 2</option>
            <option value="Structure 3">Structure 3</option>
            <option value="Structure 4">Structure 4</option>
            <option value="Structure 7">Structure 7</option>
            <option value="Structure 8">Structure 8</option>
          </select>
        </label>

        {message && <p>{message}</p>}

        <div className="posts-list">
          {posts.length === 0 && <p>No posts found.</p>}

          {posts.map((post) => (
            <article className="post-card" key={post._id}>
              <h2>{post.parkingStructure}</h2>
              <p>
                Posted by: {post.owner?.name || 'Unknown user'}
              </p>

              <h3>Schedule</h3>
              {Object.entries(post.schedule).map(([day, blocks]) => (
                <p key={day}>
                  <strong>{day}:</strong>{' '}
                  {blocks.length > 0 ? blocks.join(', ') : 'none'}
                </p>
              ))}

              {post.notes && (
                <p>
                  <strong>Notes:</strong> {post.notes}
                </p>
              )}
            </article>
          ))}
        </div>

        <a className="button secondary" href="/dashboard">
          Back to dashboard
        </a>
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

  if(path === '/create-post'){
  return <CreatePost />;
}

if(path === '/browse-posts'){
  return <BrowsePosts />;
}
  return <Home />
}

export default App;

