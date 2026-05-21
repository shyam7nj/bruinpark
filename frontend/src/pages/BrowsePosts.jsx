import { useEffect, useState } from 'react';
import PageLayout from '../components/PageLayout';
import PostCard from '../components/PostCard';

const API_URL = 'http://localhost:3001';

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
    <PageLayout wide>
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
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      <a className="button secondary" href="/dashboard">
        Back to dashboard
      </a>
    </PageLayout>
  );
}

export default BrowsePosts;