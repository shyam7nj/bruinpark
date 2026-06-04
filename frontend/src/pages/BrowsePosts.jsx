
import { useEffect, useState } from 'react';
import { getPosts, editPost, deletePostById } from '../api/postsApi';
import { createMessageRequest } from '../api/messagesApi';
import { getPostTypeLabel } from '../utils/labels';
import { PARKING_STRUCTURES, WEEKDAYS } from '../utils/constants';
import { timeAgo } from '../utils/timeUtils';
import { mergeSchedule } from '../utils/scheduleUtils';
import useCurrentUser from '../hooks/useCurrentUser';

import AppLayout from '../components/AppLayout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import ScheduleList from '../components/ScheduleList';
import '../styles/pageStyles/browsePosts.css';

function BrowsePosts() {
  const { user } = useCurrentUser();
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('Loading posts...');
  const [filterDay, setFilterDay] = useState('');
  const [filterStructure, setFilterStructure] = useState('');
  const [activePostId, setActivePostId] = useState(null);
  const [requestMessages, setRequestMessages] = useState({});
  const [requestStatus, setRequestStatus] = useState({});
  // editingId tracks which own post is currently open in the inline edit form.
  const [editingId, setEditingId] = useState(null);
  // editData holds the working copy of the post being edited, including the pending new schedule row.
  const [editData, setEditData] = useState({});
  // confirm holds the message and onConfirm callback for the ConfirmModal, or null when closed.
  const [confirm, setConfirm] = useState(null);
  // postError surfaces validation and API errors from edit/delete actions on own posts.
  const [postError, setPostError] = useState("");


  useEffect(() => {
    getPosts().then((data) => {
      setPosts(data);
      setMessage('');
    }).catch(() => {
      setMessage("Could not load posts.");
    });
  }, []);

  const filteredPosts = posts.filter((post) => !filterStructure || post.parkingStructure === filterStructure)
  .filter((post) => !filterDay || post.schedule?.some((item) => item.day === filterDay));

  // Populates editData from the post's current values and opens the inline edit form.
  function startEdit(post) {
    setEditingId(post._id);
    setEditData({
      parkingStructure: post.parkingStructure,
      schedule: post.schedule,
      notes: post.notes || "",
      newDay: "",
      newStart: "",
      newEnd: "",
    });
    setPostError("");
  }

  // Validates and adds a new time block to the edit form's schedule, merging overlaps.
  // Mirrors the same addScheduleItem logic used in Dashboard and CreatePost.
  function addScheduleItem() {
    const { newDay, newStart, newEnd } = editData;
    if (!newDay || !newStart || !newEnd) return;

    // Fixed bug: end time equal to or before start time was silently accepted, now fixed.
    if (newEnd <= newStart) {
      setPostError("End time must be after start time.");
      return;
    }

    // Fixed bug: overlapping blocks on the same day are merged into one.
    setEditData({
      ...editData,
      schedule: mergeSchedule(editData.schedule, { day: newDay, startTime: newStart, endTime: newEnd }),
      newDay: "",
      newStart: "",
      newEnd: "",
    });
    setPostError("");
  }

  // Performs the actual edit API call after the user confirms.
  async function doSaveEdit(postId) {
    setPostError("");
    try {
      const updated = await editPost(postId, {
        parkingStructure: editData.parkingStructure,
        schedule: editData.schedule,
        notes: editData.notes,
      });
      setPosts(posts.map(p => p._id === postId ? updated : p));
      setEditingId(null);
    }
    catch(err) {
      setPostError(err.message || "Could not save changes.");
    }
  }

  // Opens the confirmation modal before saving an edit.
  function confirmSaveEdit(post) {
    if (!editData.parkingStructure) { setPostError("Please select a parking structure."); return; }
    if (!editData.schedule || editData.schedule.length === 0) { setPostError("Please keep at least one schedule time."); return; }

    setConfirm({
      message: `Save changes to your post for ${editData.parkingStructure}?`,
      onConfirm: async () => { setConfirm(null); await doSaveEdit(post._id); },
    });
  }

  // Performs the actual deletion after the user confirms.
  async function doDeletePost(postId) {
    try {
      await deletePostById(postId);
      setPosts(posts.filter(p => p._id !== postId));
    }
    catch(err) {
      setPostError(err.message || "Could not delete post.");
    }
  }

  // Opens the confirmation modal before deleting a post.
  function confirmDelete(post) {
    setConfirm({
      message: `Delete your post for ${post.parkingStructure}? This can NOT be undone.`,
      onConfirm: async () => { setConfirm(null); await doDeletePost(post._id); },
    });
  }

  async function sendMessageRequest(postId){
    const requestMessage = requestMessages[postId] || "";
    try{
      await createMessageRequest({
        postId,
        message: requestMessage
      });

      setRequestStatus({
        ...requestStatus,
        [postId]: "Message request sent.",
      });

      setActivePostId(null);

      setRequestMessages({
        ...requestMessages,
        [postId]: "",
      });
    }
    catch(err){
      setRequestStatus({
        ...requestStatus,
        [postId]: err.message || "Failed to send message request."
      });
    }
  }

  return (
    <AppLayout>
      {/* Rendered at the top level so it overlays the entire page when active */}
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
      <PageHeader
        label="Parking Posts"
        title="Browse Parking Posts"
        description="View parking posts from other UCLA commuter students and look for compatible schedules."
      />

      <Card className="browse-filters-card">
        <div className="browse-filters">
          <label>
            Day
            <select value={filterDay} onChange={(event) => setFilterDay(event.target.value)}>
              <option value="">All Days</option>
              {WEEKDAYS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>
          </label>

          <label>
            Parking Structure
            <select value={filterStructure} onChange={(event) => setFilterStructure(event.target.value)}>
              <option value="">All Structures</option>
              {PARKING_STRUCTURES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
      </Card>

      {message && <p className="browse-message">{message}</p>}

      {!message && filteredPosts.length === 0 && (
        <EmptyState
          title="No matching posts found."
          message="Try changing the days or parking structure."
        />
      )}

      <div className="browse-posts-list">
        {filteredPosts.map((post) => (
          <Card className="browse-post-card" key={post._id}>
            <div className="browse-post-header">
              <div>
                <h2>{post.parkingStructure}</h2>
                {/* Shows the poster's name and how long ago the post was created */}
                <p>Posted by {post.owner?.name || "Unknown user"} · <span className="browse-post-time">{post.createdAt ? timeAgo(post.createdAt) : ""}</span></p>
              </div>

              {/* "offering" maps to info (blue), anything else is warning (yellow) */}
              <Badge variant={post.postType === "offering" ? "info" : "warning"}>
                {getPostTypeLabel(post.postType)}
              </Badge>
            </div>

            <div className="browse-post-schedule">
              <h3>Schedule</h3>

              {/* Refactor: replaced inline schedule map with shared ScheduleList component */}
              <ScheduleList schedule={post.schedule} />
            </div>

            {post.notes && (
              <p className="browse-post-notes">{post.notes}</p>
            )}

            {/* Fixed bug: users could open and send a message request to their own post —
                now detects ownership by email and shows edit/delete controls instead. */}
            {post.owner?.email === user?.email ? (
              <div className="message-request-section">
                {editingId === post._id ? (
                  <>
                    <label className="dashboard-form-label">
                      Parking Structure
                      <select
                        value={editData.parkingStructure}
                        onChange={(e) => setEditData({ ...editData, parkingStructure: e.target.value })}
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
                              schedule: editData.schedule.filter((_, i) => i !== index),
                            })}
                          >
                            Remove
                          </button>
                        </p>
                      ))}

                      <div className="dashboard-edit-schedule-row">
                        <select
                          value={editData.newDay}
                          onChange={(e) => setEditData({ ...editData, newDay: e.target.value })}
                        >
                          <option value="">Day</option>
                          {WEEKDAYS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                        </select>
                        <input type="time" value={editData.newStart} onChange={(e) => setEditData({ ...editData, newStart: e.target.value })} />
                        <input type="time" value={editData.newEnd} onChange={(e) => setEditData({ ...editData, newEnd: e.target.value })} />
                        <Button type="button" variant="secondary" onClick={addScheduleItem}>Add</Button>
                      </div>
                    </div>

                    <label className="dashboard-form-label">
                      Notes
                      <textarea
                        value={editData.notes}
                        onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      />
                    </label>

                    {postError && <p className="message-request-status">{postError}</p>}

                    <div className="dashboard-card-actions">
                      <Button type="button" onClick={() => confirmSaveEdit(post)}>Save</Button>
                      <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  // Own post view — shows Edit and Delete instead of the message request button.
                  <div className="dashboard-card-actions">
                    <Button type="button" variant="secondary" onClick={() => startEdit(post)}>Edit</Button>
                    <Button type="button" variant="danger" onClick={() => confirmDelete(post)}>Delete</Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="message-request-section">
                {activePostId === post._id ? (
                  <>
                    <label>
                      Message Request
                      <textarea value={requestMessages[post._id] || ""} onChange={(event) => setRequestMessages({
                        ...requestMessages,
                        [post._id]: event.target.value,
                      })}
                      placeholder="Add any extra details or questions for this person."
                    />
                    </label>

                    <div className="browse-post-actions">
                      <Button type="button" onClick={() => sendMessageRequest(post._id)}>
                        Send Request
                      </Button>

                      <Button type="button" variant="secondary" onClick={() => setActivePostId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button type="button" onClick={() => setActivePostId(post._id)}>
                    Send Message Request
                  </Button>
                )}

                {requestStatus[post._id] && (
                  <p className="message-request-status">{requestStatus[post._id]}</p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}

export default BrowsePosts;
