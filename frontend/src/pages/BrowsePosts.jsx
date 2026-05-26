
import { useEffect, useState } from 'react';

function BrowsePosts() {
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('Loading posts...');
  const [filterDay, setFilterDay] = useState('');
  const [filterStructure, setFilterStructure] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/posts', {
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load posts');
        }

        const data = await response.json();
        setPosts(data);
        setMessage('');
      })
      .catch(() => {
        setMessage('Could not load posts.');
      });
  }, []);

  return (
    <main className="browse-posts-page">
      <div className="browse-posts-card">
        <h1>Browse Parking Posts</h1>

        <p>
          View parking posts from other UCLA commuters and look for compatible
          schedules.
        </p>

        <details className="search-bar">
          <summary>Search By...</summary>

          <div className="search-dropdowns">
            <label>
              Day

              <select value={filterDay} onChange={(event) => setFilterDay(event.target.value)}>
                <option value="">All Days</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
              </select>
            </label>

            <label>
              Parking Structure

              <select value={filterStructure} onChange={(event) => setFilterStructure(event.target.value)}>
                <option value="">All Structures</option>
                <option value="Structure 2">Structure 2</option>
                <option value="Structure 3">Structure 3</option>
                <option value="Structure 4">Structure 4</option>
                <option value="Structure 7">Structure 7</option>
                <option value="Structure 8">Structure 8</option>
              </select>
            </label>
          </div>
        </details>

        {message && <p>{message}</p>}

        <div className="posts-list">
          {posts
            .filter((post) => !filterStructure || post.parkingStructure === filterStructure)
            .filter((post) => !filterDay || post.schedule?.some((item) => item.day === filterDay))
            .map((post) => (
              <div className="post-card" key={post._id}>
                <h2>{post.parkingStructure}</h2>

                <p>Posted by: {post.owner?.name || 'Unknown user'}</p>

                <div className="post-schedule">
                  <h3>Schedule</h3>

                  {post.schedule?.map((item, index) => (
                    <p key={`${item.day}-${item.startTime}-${item.endTime}-${index}`}>
                      <strong>{item.day}:</strong> {item.startTime} - {item.endTime}
                    </p>
                  ))}
                </div>

                <p>{post.notes}</p>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}

export default BrowsePosts;