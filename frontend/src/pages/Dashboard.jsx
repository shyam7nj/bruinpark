
import {useEffect, useState} from 'react';
import { API_URL } from '../api/client';
import { logoutCurrentUser } from '../api/authApi';
import useCurrentUser from '../hooks/useCurrentUser';
import { getUserPosts, editPost, deletePostById } from '../api/postsApi';
import { getIncomingMessageRequests, reviewMessageRequest as reviewMessageRequestApi } from '../api/messagesApi';
import { getPostTypeLabel, getVerificationMessage } from '../utils/labels';
import { PARKING_STRUCTURES, WEEKDAYS } from '../utils/constants';
import { mergeSchedule } from '../utils/scheduleUtils';

import AppLayout from '../components/AppLayout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import '../styles/pageStyles/dashboard.css';


function Dashboard(){
  const {user, status} = useCurrentUser();
  const [myPosts, setMyPosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [incomingMessage, setIncomingMessage] = useState("Loading incoming message requests...");
  const [actionError, setActionError] = useState("");
  // confirm holds the message and onConfirm callback for the ConfirmModal, or null when closed.
  const [confirm, setConfirm] = useState(null);


  useEffect(() => {
    if(status !== "Authenticated"){
      return;
    }

    getUserPosts().then(setMyPosts).catch((err) => {setActionError(err.message || "Could not load your posts.")});
  }, [status]);

  useEffect(() => {
    if(status !== "Authenticated"){
      return;
    }

    getIncomingMessageRequests().then((data) => {
      setIncomingRequests(data);
      setIncomingMessage(data.length === 0 ? "No incoming message requests" : "");
    }).catch(() => {
      setIncomingMessage("Could not load incoming message requests.");
    });
  }, [status]);

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

    // Fixed bug: end time equal to or before start time (e.g. 1:00pm–12:00pm) was silently
    // accepted — now rejected with an error message before the block is added.
    if(newEnd <= newStart){
      setActionError("End time must be after start time.");
      return;
    }

    // Fixed bug: adding a block that overlapped an existing one on the same day created
    // duplicate/conflicting entries — now merged into a single block covering the full min/max range.
    setEditData({
      ...editData,
      schedule: mergeSchedule(editData.schedule, { day: newDay, startTime: newStart, endTime: newEnd }),
      newDay: "",
      newStart: "",
      newEnd: "",
    });
    setActionError("");
  }

  async function saveEdit(postId){
    if(!editData.parkingStructure){
      setActionError("Please select a parking structure.");
      return;
    }

    if(!editData.schedule || editData.schedule.length === 0){
      setActionError("Please keep at least one schedule time.");
      return;
    }
    
    setActionError("");
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
      setActionError(err.message || "Could not save changes.");
    }
  }

  // Performs the actual deletion after the user confirms twice via the confirmation window.
  async function deletePost(postId){
    setActionError("");
    try{
      await deletePostById(postId);
      setMyPosts(myPosts.filter((post) => post._id !== postId));
    }
    catch(err){
      setActionError(err.message || "Could not delete post.");
    }
  }

  // Opens the confirmation window to prompt deletion before actually deleting a post.
  function confirmDelete(post){
    setConfirm({
      message: `Delete your post for ${post.parkingStructure}? This can NOT be undone.`,
      onConfirm: async () => { setConfirm(null); await deletePost(post._id); },
    });
  }

  async function reviewMessageRequest(requestId, action){
    setActionError("");
    try{
      const data = await reviewMessageRequestApi(requestId, action);
      setIncomingRequests(incomingRequests.map((request) => request._id === requestId ? data.messageRequest : request));
    }
    catch(err){
      setActionError(err.message || "Could not update message request.");
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
      {/* Rendered at the top level so it overlays the entire page when active */}
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

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

      {actionError && (
        <p className="dashboard-action-error">{actionError}</p>
      )}

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

              {/* If the post was deleted after the request was sent, request.post will be null —
                  show a fallback instead of silently hiding the post block. */}
              {request.post ? (
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
              ) : (
                <p className="dashboard-muted-text"><em>This post has been deleted.</em></p>
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
                      {PARKING_STRUCTURES.map(s => <option key={s} value={s}>{s}</option>)}
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
                        {WEEKDAYS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
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

                    <Button type="button" variant="danger" onClick={() => confirmDelete(post)}>
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