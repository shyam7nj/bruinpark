
import { useEffect, useState } from 'react';
import { getPosts } from '../api/postsApi';
import { createMessageRequest } from '../api/messagesApi';
import { getPostTypeLabel } from '../utils/labels';

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
    <main className="browse-posts-page">
      <div className="browse-posts-card">
        <h1>Browse Parking Posts</h1>

        <p>
          View parking posts from other UCLA commuters and look for compatible
          schedules.
        </p>

        <details className="search-bar">
          <summary>Search By...</summary>

          <div className="search-dropdowns">
            <label>
              Day

              <select value={filterDay} onChange={(event) => setFilterDay(event.target.value)}>
                <option value="">All Days</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
              </select>
            </label>

            <label>
              Parking Structure

              <select value={filterStructure} onChange={(event) => setFilterStructure(event.target.value)}>
                <option value="">All Structures</option>
                <option value="Structure 2">Structure 2</option>
                <option value="Structure 3">Structure 3</option>
                <option value="Structure 4">Structure 4</option>
                <option value="Structure 7">Structure 7</option>
                <option value="Structure 8">Structure 8</option>
              </select>
            </label>
          </div>
        </details>

        {message && <p>{message}</p>}

        <div className="posts-list">
          {posts
            .filter((post) => !filterStructure || post.parkingStructure === filterStructure)
            .filter((post) => !filterDay || post.schedule?.some((item) => item.day === filterDay))
            .map((post) => (
              <div className="post-card" key={post._id}>
                <h2>{post.parkingStructure}</h2>
                
                <p className={`post-type-label ${post.postType === "offering" ? "post-type-offering" : "post-type-looking"}`}>
                  {getPostTypeLabel(post.postType)}
                </p>

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
                <div className="message-request-section">
                  {activePostId === post._id ? (
                    <>
                      <label>
                        Message Request
                        <textarea value={requestMessages[post._id] || ''} onChange={(event) => setRequestMessages({
                          ...requestMessages,
                          [post._id]: event.target.value,
                        })}
                        placeholder="Add any extra details or questions for this commuter."
                        />
                      </label>
                      <div className="post-card-actions">
                        <button className="home-login-button" type="button" onClick={() => sendMessageRequest(post._id)}>
                          Send Request
                        </button>

                        <button className="dashboard-logout-button" type="button" onClick={() => setActivePostId(null)}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <button className="home-login-button" type="button" onClick={() => setActivePostId(post._id)}>
                      Send Message Request
                    </button>
                  )}
                  {requestStatus[post._id] && (
                    <p className="message-request-status">
                      {requestStatus[post._id]}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}

export default BrowsePosts;