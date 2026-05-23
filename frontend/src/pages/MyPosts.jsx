import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3001';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_MAP = {
  Mon: 'monday',
  Tue: 'tuesday',
  Wed: 'wednesday',
  Thu: 'thursday',
  Fri: 'friday',
};
const DAY_DISPLAY = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
};

function SchedulePicker({ schedule, onChange }) {
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  function toggleDay(day) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function addBlock() {
    if (selectedDays.length === 0 || !startTime || !endTime) return;
    const newItems = selectedDays.map((short) => ({
      day: DAY_MAP[short],
      startTime,
      endTime,
    }));
    onChange([...schedule, ...newItems]);
    setSelectedDays([]);
    setStartTime('');
    setEndTime('');
  }

  function removeBlock(index) {
    onChange(schedule.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '12px 0' }}>
        {ALL_DAYS.map((day) => {
          const active = selectedDays.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13px',
                background: active ? '#2774ae' : '#e2e8f0',
                color: active ? 'white' : '#172033',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: '600', fontSize: '14px' }}>
          Start
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
            style={{ padding: '8px', border: '2px solid #2774ae', borderRadius: '8px', font: 'inherit' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: '600', fontSize: '14px' }}>
          End
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
            style={{ padding: '8px', border: '2px solid #2774ae', borderRadius: '8px', font: 'inherit' }} />
        </label>
        <button
          type="button"
          onClick={addBlock}
          disabled={selectedDays.length === 0 || !startTime || !endTime}
          style={{
            marginTop: '20px',
            padding: '10px 18px',
            background: '#2774ae',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: selectedDays.length === 0 || !startTime || !endTime ? 'not-allowed' : 'pointer',
            opacity: selectedDays.length === 0 || !startTime || !endTime ? 0.5 : 1,
          }}
        >
          Add Time
        </button>
      </div>

      <div style={{ background: '#f5f8fc', borderRadius: '10px', padding: '12px' }}>
        {schedule.length === 0 && <p style={{ margin: 0, color: '#6b7280' }}>No times added yet.</p>}
        {schedule.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>
              {DAY_DISPLAY[item.day] || item.day}: {item.startTime} – {item.endTime}
            </span>
            <button
              type="button"
              onClick={() => removeBlock(i)}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '12px',
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditModal({ post, onClose, onSaved }) {
  const [parkingStructure, setParkingStructure] = useState(post.parkingStructure);
  const [notes, setNotes] = useState(post.notes || '');
  const [schedule, setSchedule] = useState(post.schedule || []);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError('');
    if (!parkingStructure) return setError('Parking structure is required.');
    if (schedule.length === 0) return setError('At least one schedule time is required.');

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/posts/${post._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parkingStructure, schedule, notes }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save.');
      } else {
        onSaved(data);
      }
    } catch {
      setError('Network error.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '32px',
        width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <h2 style={{ margin: '0 0 20px', color: '#2774ae' }}>Edit Post</h2>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: '700', marginBottom: '16px' }}>
          Parking Structure
          <select value={parkingStructure} onChange={(e) => setParkingStructure(e.target.value)}
            style={{ padding: '10px', border: '2px solid #2774ae', borderRadius: '8px', font: 'inherit' }}>
            <option value="">Select a structure</option>
            <option value="Structure 2">Structure 2</option>
            <option value="Structure 3">Structure 3</option>
            <option value="Structure 4">Structure 4</option>
            <option value="Structure 7">Structure 7</option>
            <option value="Structure 8">Structure 8</option>
            <option value="Structure 9">Structure 9</option>
            <option value="Structure 11">Structure 11</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: '700', marginBottom: '16px' }}>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
            style={{ minHeight: '80px', padding: '10px', border: '2px solid #2774ae', borderRadius: '8px', font: 'inherit', resize: 'vertical' }} />
        </label>

        <p style={{ fontWeight: '700', margin: '0 0 8px' }}>Schedule</p>
        <SchedulePicker schedule={schedule} onChange={setSchedule} />

        {error && <p style={{ color: '#ef4444', marginTop: '12px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose}
            style={{ padding: '10px 20px', border: '2px solid #2774ae', borderRadius: '8px', background: 'white', color: '#2774ae', fontWeight: '700', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            style={{ padding: '10px 20px', background: '#2774ae', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/posts/mine`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPosts(data);
      })
      .catch(() => setMessage('Could not load your posts.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(postId) {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to delete post.');
      }
    } catch {
      setMessage('Network error.');
    }
  }

  function handleSaved(updatedPost) {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
    setEditingPost(null);
  }

  return (
    <main className="browse-posts-page page-enter">
      <div className="browse-posts-card">
        <h1>My Posts</h1>
        <p>View, edit, or delete the parking posts you have created.</p>

        <div style={{ marginBottom: '16px' }}>
          <a className="home-login-button" href="/create-post">+ Create New Post</a>
        </div>

        {message && <p style={{ color: '#ef4444' }}>{message}</p>}
        {loading && <p>Loading your posts...</p>}

        {!loading && posts.length === 0 && (
          <p>You have not created any posts yet.</p>
        )}

        <div className="posts-list">
          {posts.map((post) => (
            <div className="post-card" key={post._id}>
              <h2>{post.parkingStructure}</h2>

              <div className="post-schedule">
                <h3>Schedule</h3>
                {post.schedule?.map((item, i) => (
                  <p key={i} style={{ margin: '4px 0', textTransform: 'capitalize' }}>
                    <strong>{DAY_DISPLAY[item.day] || item.day}:</strong> {item.startTime} – {item.endTime}
                  </p>
                ))}
              </div>

              {post.notes && (
                <p><strong>Notes:</strong> {post.notes}</p>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  onClick={() => setEditingPost(post)}
                  style={{
                    padding: '8px 18px', background: '#2774ae', color: 'white',
                    border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post._id)}
                  style={{
                    padding: '8px 18px', background: '#ef4444', color: 'white',
                    border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingPost && (
        <EditModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={handleSaved}
        />
      )}
    </main>
  );
}

export default MyPosts;