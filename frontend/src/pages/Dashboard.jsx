
import {useEffect, useState} from 'react';
import { API_URL } from '../api/client';
import { getCurrentUser, logoutCurrentUser } from '../api/authApi';
import { getUserPosts, editPost, deletePostById } from '../api/postsApi';
import { getIncomingMessageRequests, reviewMessageRequest as reviewMessageRequestApi } from '../api/messagesApi';

function Dashboard(){
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Loading");
  const [myPosts, setMyPosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [incomingMessage, setIncomingMessage] = useState("Loading incoming message requests...");

  useEffect(() => {
    getCurrentUser().then((data) => {
      setUser(data);
      setStatus("Authenticated");
    }).catch(() => {
      setStatus("Unauthenticated");
    });
  }, []);

  useEffect(() => {
    getUserPosts().then(setMyPosts).catch(() => {});
  }, []);


  useEffect(() => {
    getIncomingMessageRequests().then((data) => {
      setIncomingRequests(data);
      setIncomingMessage(data.length === 0 ? "No incoming message requests." : "");
    }).catch(() => {
      setIncomingMessage("Could not load incoming message requests.");
    });
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
    try{
      const updated = await editPost(postId, {
        parkingStructure: editData.parkingStructure,
        schedule: editData.schedule,
        notes: editData.notes,
      });

      setMyPosts(myPosts.map((post) => post._id === postId ? updated : post));
      setEditingId(null);
    }
    catch(err){
      console.error(err.message);
    }
  }

  async function deletePost(postId){
    try{
      await deletePostById(postId);
      setMyPosts(myPosts.filter((post) => post._id !== postId));
    }
    catch(err){
      console.error(err.message);
    }
  }

  async function reviewMessageRequest(requestId, action){
    try{
      const data = await reviewMessageRequestApi(requestId, action);
      setIncomingRequests(incomingRequests.map((request) => 
        request._id === requestId ? data.messageRequest : request
      ));
    }
    catch(err){
      console.error(err.message);
    }
  }

  async function logout(){
    await logoutCurrentUser();
    window.location.href = "/";
  }

  function getVerificationMessage(){
    if(user.verificationStatus === "verified"){
      return "Your parking permit has been verified.";
    }

    if(user.verificationStatus === "pending"){
      return "Your permit verification is pending admin review.";
    }

    if(user.verificationStatus === "rejected"){
      return user.verificationRejectionReason || "Your permit verification was rejected. Please upload a new screenshot.";
    }

    return "You have not verified your parking permit yet.";
  }

  function getPostTypeLabel(postType){
    if(postType === "offering"){
      return "Offering parking permit";
    }
    return "Looking for parking permit";
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
        
        <div className="verification-status-card">
          <h2>Permit Verification</h2>

          <p>Status: {user.verificationStatus || "unverified"}</p>
          <p>{getVerificationMessage()}</p>

          {(user.verificationStatus === "unverified" || user.verificationStatus === "rejected" || !user.verificationStatus) && (
            <a className="home-login-button" href="/verify">
              Verify Permit
            </a>
          )}

          {user.isAdmin && (
            <a className="home-login-button" href="/admin/verify">
              Review Permit Verifications
            </a>
          )}
        </div>

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
        <h2 style={{color: '#2774ae', margin: '0 0 16px'}}>Incoming Message Requests</h2>

          {incomingMessage && <p>{incomingMessage}</p>}

          {incomingRequests.map((request) => (
            <div className="message-request-card" key={request._id}>
              <h3>Request from {request.sender?.name || "Unknown user"}</h3>

              <p>Email: {request.sender?.email || "No available email"}</p>
              <p>Status: {request.status}</p>
              
              {request.createdAt && (
                <p>Sent: {new Date(request.createdAt).toLocaleString()}</p>
              )}

              {request.post && (
                <div className="post-schedule">
                  <h3>{request.post.parkingStructure}</h3>
                  <p className={`post-type-label ${request.post.postType === "offering" ? "post-type-offering": "post-type-looking"}`}>
                    {getPostTypeLabel(request.post.postType)}
                  </p>

                  {request.post.schedule?.map((item, index) => (
                    <p key={`${item.day}-${item.startTime}-${item.endTime}-${index}`}>
                      <strong>{item.day}:</strong> {item.startTime} - {item.endTime}
                    </p>
                  ))}
                </div>
              )}
              <p>
                <strong>Message:</strong> {request.message || "No message included."}
              </p>
              {request.status === "pending" && (
                <div className="post-card-actions">
                  <button className="home-login-button" type="button" onClick={() => reviewMessageRequest(request._id, "accept")}>
                    Accept
                  </button>
                  <button className="dashboard-logout-button" type="button" onClick={() => reviewMessageRequest(request._id, "reject")}>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
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

                <p className={`post-type-label ${post.postType === "offering" ? "post-type-offering" : "post-type-looking"}`}>
                  {getPostTypeLabel(post.postType)}
                </p>
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