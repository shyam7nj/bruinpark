
import {useEffect, useState} from 'react';

const API_URL = "http://localhost:3001";

function Dashboard(){
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Loading");
  const [myPosts, setMyPosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    }).then(async (response) => {
      if(!response.ok){
        throw new Error("Not Logged In");
      }

      const data = await response.json();
      setUser(data);
      setStatus("Authenticated");
    }).catch(() => {
      setStatus("Unauthenticated");
    });
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/posts/mine`, {
      credentials: "include",
    }).then((response) => {
      if(response.ok){
        return response.json();
      }

      return [];
    }).then(setMyPosts)
      .catch(() => {});
  }, []);

  function startEdit(post){
    setEditingId(post._id);
    setEditData({
      parkingStructure: post.parkingStructure,
      schedule: post.schedule,
      notes: post.notes || '',
      newDay: '',
      newStart: '',
      newEnd: '',
    });
  }

  function addEditScheduleItem(){
    const { newDay, newStart, newEnd } = editData;

    if(!newDay || !newStart || !newEnd){
      return;
    }

    setEditData({
      ...editData,
      schedule: [...editData.schedule, { day: newDay, startTime: newStart, endTime: newEnd }],
      newDay: '',
      newStart: '',
      newEnd: '',
    });
  }

  async function saveEdit(postId){
    const response = await fetch(`${API_URL}/api/posts/${postId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parkingStructure: editData.parkingStructure,
        schedule: editData.schedule,
        notes: editData.notes,
      }),
    });

    if(response.ok){
      const updated = await response.json();
      setMyPosts(myPosts.map((post) => post._id === postId ? updated : post));
      setEditingId(null);
    }
  }

  async function deletePost(postId){
    await fetch(`${API_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    setMyPosts(myPosts.filter((post) => post._id !== postId));
  }

  async function logout(){
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = '/';
  }

  if(status === "Loading"){
    return(
      <main className="dashboard-page">
        <div className="dashboard-card">
          <p>Loading Dashboard, hang tight...</p>
        </div>
      </main>
    );
  }

  if(status === "Unauthenticated"){
    return(
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


  return(
    <main className="dashboard-page">
      <div className="dashboard-card">
        <h1>Dashboard</h1>

        <p>Welcome to your Dashboard, {user.name}.</p>
        <p>Email: {user.email}</p>

        <div className="dashboard-buttons">
          <a className="home-login-button" href="/create-post">
            Create Parking Post
          </a>

          <a className="home-login-button" href="/browse-posts">
            Browse Parking Posts
          </a>
        </div>

        <button className="dashboard-logout-button" onClick={logout}>
          Log Out
        </button>
      </div>

      <div className="dashboard-card" style={{marginTop: '24px', textAlign: 'left'}}>
        <h2 style={{color: '#2774ae', margin: '0 0 16px'}}>My Posts</h2>

        {myPosts.length === 0 && <p>You have not created any posts yet.</p>}

        {myPosts.map((post) => (
          <div className="post-card" key={post._id}>
            {editingId === post._id ? (
              <>
                <label className="post-edit-label">
                  Parking Structure

                  <select
                    value={editData.parkingStructure}
                    onChange={(event) => setEditData({ ...editData, parkingStructure: event.target.value })}
                  >
                    <option value="Structure 2">Structure 2</option>
                    <option value="Structure 3">Structure 3</option>
                    <option value="Structure 4">Structure 4</option>
                    <option value="Structure 7">Structure 7</option>
                    <option value="Structure 8">Structure 8</option>
                  </select>
                </label>

                <div className="post-schedule">
                  <h3>Schedule</h3>

                  {editData.schedule.map((item, index) => (
                    <p key={index}>
                      <strong>{item.day}:</strong> {item.startTime} - {item.endTime}

                      <button
                        className="post-edit-remove"
                        onClick={() => setEditData({
                          ...editData,
                          schedule: editData.schedule.filter((_, scheduleIndex) => scheduleIndex !== index),
                        })}
                      >
                        Remove
                      </button>
                    </p>
                  ))}

                  <div className="post-edit-add-row">
                    <select
                      value={editData.newDay}
                      onChange={(event) => setEditData({ ...editData, newDay: event.target.value })}
                    >
                      <option value="">Day</option>
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                    </select>

                    <input
                      type="time"
                      value={editData.newStart}
                      onChange={(event) => setEditData({ ...editData, newStart: event.target.value })}
                    />

                    <input
                      type="time"
                      value={editData.newEnd}
                      onChange={(event) => setEditData({ ...editData, newEnd: event.target.value })}
                    />

                    <button className="dashboard-logout-button" onClick={addEditScheduleItem}>
                      Add
                    </button>
                  </div>
                </div>

                <label className="post-edit-label">
                  Notes

                  <textarea
                    value={editData.notes}
                    onChange={(event) => setEditData({ ...editData, notes: event.target.value })}
                  />
                </label>

                <div className="post-card-actions">
                  <button className="home-login-button" onClick={() => saveEdit(post._id)}>
                    Save
                  </button>

                  <button className="dashboard-logout-button" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>{post.parkingStructure}</h2>

                <div className="post-schedule">
                  <h3>Schedule</h3>

                  {post.schedule?.map((item, index) => (
                    <p key={index}>
                      <strong>{item.day}:</strong> {item.startTime} - {item.endTime}
                    </p>
                  ))}
                </div>

                {post.notes && <p>{post.notes}</p>}

                <div className="post-card-actions">
                  <button className="home-login-button" onClick={() => startEdit(post)}>
                    Edit
                  </button>

                  <button className="dashboard-logout-button" onClick={() => deletePost(post._id)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

export default Dashboard;