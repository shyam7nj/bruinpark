
import {useEffect, useState} from 'react';
import { API_URL } from '../api/client';
import { getCurrentUser, logoutCurrentUser } from '../api/authApi';
import { getUserPosts, editPost, deletePostById } from '../api/postsApi';
import { getIncomingMessageRequests, reviewMessageRequest as reviewMessageRequestApi } from '../api/messagesApi';
import { getPostTypeLabel, getVerificationMessage } from '../utils/labels';

import AppLayout from '../components/AppLayout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import '../styles/pageStyles/dashboard.css';


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
      setIncomingMessage(data.length === 0 ? "No incoming message requests" : "");
    }).catch(() => {
      setIncomingMessage("Could not load incoming message requests.");
    });
  }, []);

  function startEdit(post){
    setEditingId(post._id);
    setEditData({
      parkingStructure: post.parkingStructure,
      schedule: post.schedule,
      notes: post.notes || "",
      newDay: "",
      newStart: "",
      newEnd: "",
    });
  }

  function addScheduleItem(){
    const {newDay, newStart, newEnd} = editData;
    if(!newDay || !newStart || !newEnd){
      return;
    }

    setEditData({
      ...editData,
      schedule: [...editData.schedule, {day: newDay, startTime: newStart, endTime: newEnd}],
      newDay: "",
      newStart: "",
      newEnd: "",
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
      setIncomingRequests(incomingRequests.map((request) => request._id === requestId ? data.messageRequest : request));
    }
    catch(err){
      console.error(err.message);
    }
  }

  async function logout(){
    await logoutCurrentUser();
    window.location.href = "/";
  }

  if(status === "Loading"){
    return(
      <AppLayout>
        <Card className="dashboard-status-card">
          <p>Loading Dashboard...</p>
        </Card>
      </AppLayout>
    );
  }

  if(status === "Unauthenticated"){
    return(
      <AppLayout>
        <Card className="dashboard-status-card">
          <PageHeader
            label="Login required"
            title="Not logged in"
            description="You need to log in with your UCLA Google account before accessing your dashboard."
            actions={
              <Button href={`${API_URL}/auth/google`}>
                Log in with Google
              </Button>
            }
          />
        </Card>
      </AppLayout>
    );
  }


  return(
    <AppLayout>
      <section className="dashboard-page-header">
        <PageHeader
          label="Dashboard"
          title={`Welcome back, ${user?.name?.split(" ")[0] || "User"}`}
          description="Manage your parking posts, permit verification, and message requests."
        />
      </section>

      <div className="dashboard-overview-grid">
        <Card className="dashboard-profile-card">
          <h2>Account</h2>
          <p className="dashboard-email-pill">{user?.email}</p>

          <div className="dashboard-profile-actions">
            <Button href="/create-post">
              Create Post
            </Button>

            <Button type="button" variant="danger" onClick={logout}>
              Log Out
            </Button>
          </div>
        </Card>

        <Card className="dashboard-verification-card">
          <div className="dashboard-card-header">
            <h2>Permit Status</h2>
            <Badge variant={user?.verificationStatus === "verified" ? "success" : "warning"}>
              {user?.verificationStatus || "unverified"}
            </Badge>
          </div>

          <p>{getVerificationMessage(user)}</p>

          {(user?.verificationStatus === "unverified" || user?.verificationStatus === "rejected" || !user?.verificationStatus) && (
            <Button href="/verify">
              Verify Permit
            </Button>
          )}

          {user?.isAdmin && (
            <Button href="/admin/verify" variant="secondary">
              Review Permit Verifications
            </Button>
          )}
        </Card>

        <Card className="dashboard-summary-card">
          <h2>Summary</h2>

          <div className="dashboard-summary-list">
            <div>
              <span>Your posts: </span>
              <strong>{myPosts.length}</strong>
            </div>

            <div>
              <span>Message requests: </span>
              <strong>{incomingRequests.length}</strong>
            </div>

            <div>
              <span>Permit status: </span>
              <strong>{user?.verificationStatus || "unverified"}</strong>
            </div>
          </div>
        </Card>
      </div>

    <div className="dashboard-main-grid">
      <Card className="dashboard-section-card">
        <div className='dashboard-section-header'>
          <div>
            <h2>Incoming Message Requests</h2>
            <p>Review requests from students who want to connect about your posts.</p>
          </div>
        </div>

        {incomingMessage && (
          <p className="dashboard-muted-text">{incomingMessage}</p>
        )}

        <div className="dashboard-request-list">
          {incomingRequests.map((request) => (
            <div className="dashboard-request-card" key={request._id}>
              <div className="dashboard-request-header">
                <div>
                  <h3>Request from {request.sender?.name || "Unknown user"}</h3>
                  <p>{request.sender?.email || "No available email"}</p>
                </div>

                <Badge variant={request.status === "accepted" ? "success" : request.status === "rejected" ? "danger" : "warning"}>
                  {request.status}
                </Badge>
              </div>

              {request.createdAt && (
                <p className="dashboard-muted-text">Sent {new Date(request.createdAt).toLocaleString()}</p>
              )}

              {request.post && (
                <div className="dashboard-linked-post">
                  <div className="dashboard-card-header">
                    <h3>{request.post.parkingStructure}</h3>

                    <Badge variant={request.post.postType === "offering" ? "info" : "warning"}>
                      {getPostTypeLabel(request.post.postType)}
                    </Badge>
                  </div>

                  {request.post.schedule?.map((item, index) => (
                    <p key={`${item.day}-${item.startTime}-${item.endTime}-${index}`}>
                      <strong>{item.day}:</strong> {item.startTime} - {item.endTime}
                    </p>
                  ))}
                </div>
              )}

              <p className="dashboard-request-message">
                <strong>Message:</strong> {request.message || "No message included."}
              </p>

              {request.status === "pending" && (
                <div className="dashboard-card-actions">
                  <Button type="button" onClick={() => reviewMessageRequest(request._id, "accept")}>
                    Accept
                  </Button>

                  <Button type="button" variant="danger" onClick={() => reviewMessageRequest(request._id, "reject")}>
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="dashboard-section-card">
        <div className="dashboard-section-header">
          <div>
            <h2>My Posts</h2>
            <p>Edit, delete, and review the parking posts you have created.</p>
          </div>

          <Button href="/create-post">
            Create Post
          </Button>
        </div>

        {myPosts.length === 0 && (
          <EmptyState
            title="No posts yet"
            message="Create your first parking post so other commuters can find you."
          />
        )}

        <div className="dashboard-post-list">
          {myPosts.map((post) => (
            <div className="dashboard-post-card" key={post._id}>
              {editingId === post._id ? (
                <>
                  <label className="dashboard-form-label">
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

                  <div className="dashboard-linked-post">
                    <h3>Schedule</h3>
                    {editData.schedule?.map((item, index) => (
                      <p key={`${item.day}-${item.startTime}-${item.endTime}-${index}`}>
                        <strong>{item.day}:</strong> {item.startTime} - {item.endTime}

                        <button
                          className="dashboard-text-button"
                          type="button"
                          onClick={() => setEditData({
                            ...editData,
                            schedule: editData.schedule.filter((_, scheduleIndex) => scheduleIndex !== index),
                          })}
                        >
                          Remove
                        </button>
                      </p>
                    ))}

                    <div className="dashboard-edit-schedule-row">
                      <select
                        value={editData.newDay}
                        onChange={(event) => setEditData({...editData, newDay: event.target.value})}
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
                        onChange={(event) => setEditData({...editData, newStart: event.target.value })}
                      />
                    
                      <input
                        type="time"
                        value={editData.newEnd}
                        onChange={(event) => setEditData({ ...editData, newEnd: event.target.value })}
                      />

                      <Button type="button" variant="secondary" onClick={addScheduleItem}>
                        Add
                      </Button>
                    </div>
                  </div>

                  <label className="dashboard-form-label">
                    Notes
                    <textarea
                      value={editData.notes}
                      onChange={(event) => setEditData({...editData, notes: event.target.value})}
                    />
                  </label>

                  <div className="dashboard-card-actions">
                    <Button type="button" onClick={() => saveEdit(post._id)}>
                      Save
                    </Button>

                    <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="dashboard-request-header">
                    <div>
                      <h3>{post.parkingStructure}</h3>
                    </div>

                    <Badge variant={post.postType === "offering" ? "info" : "warning"}>
                      {getPostTypeLabel(post.postType)}
                    </Badge>
                  </div>

                  <div className="dashboard-linked-post">
                    <h3>Schedule</h3>
                    {post.schedule?.map((item, index) => (
                      <p key={`${item.day}-${item.startTime}-${item.endTime}-${index}`}>
                        <strong>{item.day}:</strong> {item.startTime} - {item.endTime}
                      </p>
                    ))}
                  </div>

                  {post.notes && (
                    <p className="dashboard-request-message">{post.notes}</p>
                  )}

                  <div className="dashboard-card-actions">
                    <Button type="button" onClick={() => startEdit(post)}>
                      Edit
                    </Button>

                    <Button type="button" variant="danger" onClick={() => deletePost(post._id)}>
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>
      </div>
    </AppLayout>
  );
}

export default Dashboard;