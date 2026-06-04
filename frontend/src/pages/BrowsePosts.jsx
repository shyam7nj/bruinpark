
import { useEffect, useState } from 'react';
import { getPosts } from '../api/postsApi';
import { createMessageRequest } from '../api/messagesApi';
import { getPostTypeLabel } from '../utils/labels';
import { PARKING_STRUCTURES, WEEKDAYS } from '../utils/constants';

import AppLayout from '../components/AppLayout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import '../styles/pageStyles/browsePosts.css';

function BrowsePosts() {
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('Loading posts...');
  const [filterDay, setFilterDay] = useState('');
  const [filterStructure, setFilterStructure] = useState('');
  const [activePostId, setActivePostId] = useState(null);
  const [requestMessages, setRequestMessages] = useState({});
  const [requestStatus, setRequestStatus] = useState({});


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
                <p>Posted by {post.owner?.name || "Unknown user"}</p>
              </div>

              {/* Refactor: "offering" maps to info (blue), anything else is warning (yellow) */}
              <Badge variant={post.postType === "offering" ? "info" : "warning"}>
                {getPostTypeLabel(post.postType)}
              </Badge>
            </div>

            <div className="browse-post-schedule">
              <h3>Schedule</h3>

              {post.schedule?.map((item, index) =>(
                <p key={`${item.day}-${item.startTime}-${item.endTime}-${index}`}>
                  <strong>{item.day}:</strong> {item.startTime} - {item.endTime}
                </p>
              ))}
            </div>

            {post.notes && (
              <p className="browse-post-notes">{post.notes}</p>
            )}
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
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}

export default BrowsePosts;