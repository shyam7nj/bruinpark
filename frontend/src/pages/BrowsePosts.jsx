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



function formatTime(time) {
  if (!time) return '';
  const [hourStr, minute] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minute} ${ampm}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const past = new Date(dateStr);
  const seconds = Math.floor((now - past) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}



const MAP_EMBEDS = {
  'Structure 2': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1261.5671237051129!2d-118.44065590486038!3d34.06854862436538!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc878affdd69%3A0x6cc7e5e24a597905!2sParking%20Structure%202%2C%20Los%20Angeles%2C%20CA!5e0!3m2!1sen!2sus!4v1779506355651!5m2!1sen!2sus',
  'Structure 3': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3304.7003269151987!2d-118.44259692439267!3d34.07719551641251!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc8a795600dd%3A0xec697e3a80ce9b83!2sParking%20Structure%203%2C%20215%20Charles%20E%20Young%20Dr%20N%2C%20Los%20Angeles%2C%20CA%2090024!5e0!3m2!1sen!2sus!4v1779506410229!5m2!1sen!2sus',
  'Structure 4': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6609.759639444802!2d-118.44734882439309!3d34.07259491665573!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc894adea999%3A0x1796b84964298e5a!2sParking%20Structure%204%2C%20221%20Westwood%20Plaza%2C%20Los%20Angeles%2C%20CA%2090095!5e0!3m2!1sen!2sus!4v1779506428833!5m2!1sen!2sus',
  'Structure 7': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6609.718340243569!2d-118.44947662439291!3d34.07312421662764!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc8ea39d0597%3A0xadcc3bdd65bc9d13!2sParking%20Structure%207%20-%20Underground%2C%20Charles%20E%20Young%20Dr%20N%2C%20Los%20Angeles%2C%20CA%2090095!5e0!3m2!1sen!2sus!4v1779506452915!5m2!1sen!2sus',
  'Structure 8': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.0667768651488!2d-118.44916452439324!3d34.06780241690882!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc85f1f41865%3A0xbf48e42d9c4d478!2sStructure%208%20Driveway%2C%20Los%20Angeles%2C%20CA%2090095!5e0!3m2!1sen!2sus!4v1779506482198!5m2!1sen!2sus',
  'Structure 9': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.0838115391575!2d-118.44635812439326!3d34.06736571693179!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc8643c172a7%3A0x2b63fca22e7d1b95!2sStructure%209%20Parking%20Entry%2FExit%2C%20Los%20Angeles%2C%20CA!5e0!3m2!1sen!2sus!4v1779506521848!5m2!1sen!2sus',
  'Structure 11': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1204.0229172551055!2d-118.45368835434132!3d34.074577649529516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc92fb8042e7%3A0x51992d08a739455b!2sParking%20Lot%2011%2C%20De%20Neve%20Dr%2C%20Los%20Angeles%2C%20CA%2090024!5e0!3m2!1sen!2sus!4v1779506546113!5m2!1sen!2sus',
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
              {DAY_DISPLAY[item.day] || item.day}: {formatTime(item.startTime)} – {formatTime(item.endTime)}
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

function EditModal({ post, onClose, onSaved, onDeleted }) {
  const [parkingStructure, setParkingStructure] = useState(post.parkingStructure);
  const [notes, setNotes] = useState(post.notes || '');
  const [schedule, setSchedule] = useState(post.schedule || []);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/posts/${post._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        onDeleted(post._id);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete post.');
        setConfirmDelete(false);
      }
    } catch {
      setError('Network error.');
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

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

        {confirmDelete ? (
          <div style={{
            marginTop: '24px', background: '#fef2f2', border: '2px solid #ef4444',
            borderRadius: '12px', padding: '16px',
          }}>
            <p style={{ margin: '0 0 12px', fontWeight: '700', color: '#991b1b' }}>
              Are you sure you want to delete this post? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                style={{ padding: '8px 18px', border: '2px solid #6b7280', borderRadius: '8px', background: 'white', color: '#374151', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: '8px 18px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" onClick={() => setConfirmDelete(true)}
              style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
              Delete Post
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
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
        )}
      </div>
    </div>
  );
}

function BrowsePosts() {
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('Loading posts...');
  const [currentUser, setCurrentUser] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [showMapId, setShowMapId] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setCurrentUser(data))
      .catch(() => {});

    fetch(`${API_URL}/api/posts`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load posts');
        const data = await res.json();
        setPosts(data);
        setMessage('');
      })
      .catch(() => setMessage('Could not load posts.'));
  }, []);

  function handleContact(post) {
    const ownerEmail = post.owner?.email;
    const ownerName = post.owner?.name || 'a BruinPark user';
    const subject = encodeURIComponent(`BruinPark – Interested in your ${post.parkingStructure} permit`);
    const body = encodeURIComponent(
      `Hi ${ownerName},\n\nI came across your parking post on BruinPark for ${post.parkingStructure} and I think our schedules might be compatible.\n\nI'd love to connect and see if we can work something out!\n\nThanks`
    );
    window.location.href = `mailto:${ownerEmail}?subject=${subject}&body=${body}`;
  }

  function handleDeleted(postId) {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    setEditingPost(null);
  }

  function handleSaved(updatedPost) {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? { ...updatedPost, owner: p.owner } : p)));
    setEditingPost(null);
  }

  return (
    <main className="browse-posts-page page-enter">
      <div className="browse-posts-card">
        <h1>Browse Parking Posts</h1>

        <p>
          View parking posts from other UCLA commuters and look for compatible
          schedules. Click <strong>Contact</strong> to email a permit holder directly.
        </p>

        {message && <p>{message}</p>}

        <div className="posts-list">
          {posts.map((post) => {
            const isOwnPost = currentUser && post.owner?.email === currentUser.email;

            return (
              <div className="post-card" key={post._id}>
                <h2>{post.parkingStructure}</h2>

                <p>
                  Posted by: <strong>{post.owner?.name || 'Unknown user'}</strong>
                  <span style={{ marginLeft: '10px', fontSize: '13px', color: '#9ca3af', fontWeight: '400' }}>
                    · {timeAgo(post.createdAt)}
                  </span>
                </p>

                <div className="post-schedule">
                  <h3>Schedule</h3>
                  {post.schedule?.map((item, index) => (
                    <p
                      key={`${item.day}-${item.startTime}-${item.endTime}-${index}`}
                      style={{ margin: '4px 0', textTransform: 'capitalize' }}
                    >
                      <strong>{DAY_DISPLAY[item.day] || item.day}:</strong>{' '}
                      {formatTime(item.startTime)} – {formatTime(item.endTime)}
                    </p>
                  ))}
                </div>

                {post.notes && (
                  <p><strong>Notes:</strong> {post.notes}</p>
                )}

                {/* Show Location toggle */}
                <div style={{ marginTop: '12px' }}>
                  <button
                    onClick={() => setShowMapId(showMapId === post._id ? null : post._id)}
                    style={{
                      padding: '6px 14px',
                      background: 'white',
                      color: '#2774ae',
                      border: '2px solid #2774ae',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {showMapId === post._id ? 'Hide Location' : 'Show Location'}
                  </button>

                  {showMapId === post._id && MAP_EMBEDS[post.parkingStructure] && (
                    <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden' }}>
                      <iframe
                        src={MAP_EMBEDS[post.parkingStructure]}
                        width="100%"
                        height="300"
                        style={{ border: 0, display: 'block' }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Map for ${post.parkingStructure}`}
                      />
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '16px' }}>
                  {isOwnPost ? (
                    <button
                      onClick={() => setEditingPost(post)}
                      style={{
                        padding: '8px 18px',
                        background: '#2774ae',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      Edit Post
                    </button>
                  ) : (
                    <button
                      onClick={() => handleContact(post)}
                      style={{
                        padding: '8px 18px',
                        background: '#2774ae',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      Contact {post.owner?.name?.split(' ')[0] || 'User'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingPost && (
        <EditModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </main>
  );
}

export default BrowsePosts;