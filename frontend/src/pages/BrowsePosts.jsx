import { useEffect, useState } from 'react';

function BrowsePosts() {
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('Loading posts...');

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

        {message && <p>{message}</p>}

        <div className="posts-list">
          {posts.map((post) => (
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