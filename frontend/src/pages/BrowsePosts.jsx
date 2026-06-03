
import { useEffect, useState } from 'react';
import { getPosts, getUserPosts } from '../api/postsApi';
import { createMessageRequest } from '../api/messagesApi';
import { getPostTypeLabel } from '../utils/labels';

import AppLayout from '../components/AppLayout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import '../styles/pageStyles/browsePosts.css';

/* helper: convert "HH:MM" to minutes since midnight for arithmetic. */
function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/* compute total overlapping minutes between two post schedules. */
function computeOverlapMinutes(scheduleA, scheduleB) {
  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  let total = 0;
  for (const day of DAYS) {
    const as = scheduleA.filter(s => s.day === day);
    if (as.length === 0) continue;
    const bs = scheduleB.filter(s => s.day === day);
    if (bs.length === 0) continue;
    for (const a of as) {
      const aStart = timeToMinutes(a.startTime);
      const aEnd   = timeToMinutes(a.endTime);
      for (const b of bs) {
        const start = Math.max(aStart, timeToMinutes(b.startTime));
        const end   = Math.min(aEnd,   timeToMinutes(b.endTime));
        if (end > start) total += end - start;
      }
    }
  }
  return total;
}

function BrowsePosts() {
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('Loading posts...');
  const [filterDay, setFilterDay] = useState('');
  const [filterStructure, setFilterStructure] = useState('');
  const [activePostId, setActivePostId] = useState(null);
  const [requestMessages, setRequestMessages] = useState({});
  const [requestStatus, setRequestStatus] = useState({});
  
  const [matchModal, setMatchModal] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  //null = browse view; { fromPost, results: [{post, overlapMinutes}] } = results view
  const [matchResults, setMatchResults] = useState(null);


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

  function getBadge(postType){
    if(postType === "offering"){
      return "info";
    }
    return "warning";
  }

  /* fetch the current user's posts and show corresponding state. */
  async function openMatchFinder() {
    setMatchModal("loading");
    setSelectedPostId(null);
    try {
      const userPosts = await getUserPosts();
      setMyPosts(userPosts);
      setMatchModal(userPosts.length === 0 ? "no-posts" : "select");
    } catch {
      setMatchModal("no-posts");
    }
  }

  /* runMatch: called when user clicks Continue in the modal */
  function runMatch() {
    const fromPost = myPosts.find(p => p._id === selectedPostId);
    if (!fromPost) return;

    const ownPostIds = new Set(myPosts.map(p => p._id));
    const oppositeType = fromPost.postType === 'looking' ? 'offering' : 'looking';

    // step 1: type filter + exclude own posts
    const candidates = posts.filter(
      p => p.postType === oppositeType && !ownPostIds.has(p._id)
    );

    // step 2: score each candidate by total overlapping minutes
    const scored = candidates.map(post => ({
      post,
      overlapMinutes: computeOverlapMinutes(fromPost.schedule, post.schedule),
    }));

    // step 3: display perfect matches first, then ascending by overlap, top 5
    const perfect = scored.filter(s => s.overlapMinutes === 0);
    const partial = scored
      .filter(s => s.overlapMinutes > 0)
      .sort((a, b) => a.overlapMinutes - b.overlapMinutes);

    setMatchResults({ fromPost, results: [...perfect, ...partial].slice(0, 5) });
    setMatchModal(null);
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
      <PageHeader
        label="Parking Posts"
        title="Browse Parking Posts"
        description="View parking posts from other UCLA commuter students and look for compatible schedules."
        actions={
          <Button type="button" onClick={openMatchFinder}>
            Find Potential Match
          </Button>
        }
      />

      {matchResults !== null ? (
        /* showing Match Results View */
        <div className="match-results">
          <div className="match-results-header">
            <div>
              <h2>Top Matches</h2>
              <p>
                Based on your <strong>{matchResults.fromPost.parkingStructure}</strong> post.
                {matchResults.results.length === 0
                  ? " No compatible matches found yet — check back later."
                  : ` Showing ${matchResults.results.length} result${matchResults.results.length > 1 ? 's' : ''}, best first.`}
              </p>
            </div>
            <Button variant="secondary" onClick={() => setMatchResults(null)}>
              Back to Browse
            </Button>
          </div>

          {matchResults.results.length === 0 && (
            <EmptyState
              title="No matches found"
              message="No posts with a compatible type and schedule exist yet."
            />
          )}

          <div className="browse-posts-list">
            {matchResults.results.map(({ post, overlapMinutes }) => (
              <Card className="browse-post-card" key={post._id}>
                <div className="browse-post-header">
                  <div>
                    <h2>{post.parkingStructure}</h2>
                    <p>Posted by {post.owner?.name || "Unknown user"}</p>
                  </div>
                  <Badge variant={getBadge(post.postType)}>
                    {getPostTypeLabel(post.postType)}
                  </Badge>
                </div>

                {/* zero overlap is a perfect match, O(1) complexity */}
                <div className={`match-score ${overlapMinutes === 0 ? 'match-score-perfect' : 'match-score-partial'}`}>
                  {overlapMinutes === 0
                    ? "Perfect match — no schedule conflict"
                    : `${overlapMinutes} min of schedule overlap`}
                </div>

                <div className="browse-post-schedule">
                  <h3>Schedule</h3>
                  {post.schedule?.map((item, index) => (
                    <p key={`${item.day}-${item.startTime}-${item.endTime}-${index}`}>
                      <strong>{item.day}:</strong> {item.startTime} - {item.endTime}
                    </p>
                  ))}
                </div>

                {post.notes && <p className="browse-post-notes">{post.notes}</p>}

                <div className="message-request-section">
                  {activePostId === post._id ? (
                    <>
                      <label>
                        Message Request
                        <textarea
                          value={requestMessages[post._id] || ""}
                          onChange={(event) => setRequestMessages({
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
        </div>
      ) : (
        /*Normal Browse View*/
        <>
          <Card className="browse-filters-card">
            <div className="browse-filters">
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
                  <Badge variant={getBadge(post.postType)}>
                    {getPostTypeLabel(post.postType)}
                  </Badge>
                </div>

                <div className="browse-post-schedule">
                  <h3>Schedule</h3>
                  {post.schedule?.map((item, index) => (
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
                        <textarea
                          value={requestMessages[post._id] || ""}
                          onChange={(event) => setRequestMessages({
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
        </>
      )}
      {matchModal && (
        <div className="match-modal-overlay" onClick={() => setMatchModal(null)}>
          <div className="match-modal" onClick={(e) => e.stopPropagation()}>

            {matchModal === "loading" && (
              <p>Checking your posts…</p>
            )}

            {matchModal === "no-posts" && (
              <>
                <h2>No posts yet</h2>
                <p>
                  You need an active parking post before we can find you a
                  potential match. Create one first, then come back here.
                </p>
                <div className="match-modal-actions">
                  <Button href="/create-post">Create a Post</Button>
                  <Button variant="secondary" onClick={() => setMatchModal(null)}>Cancel</Button>
                </div>
              </>
            )}

            {matchModal === "select" && (
              <>
                <h2>Select a Post to Match From</h2>
                <p>Choose which of your posts you'd like to use to find a compatible match.</p>

                <div className="match-post-list">
                  {myPosts.map((post) => (
                    <button
                      key={post._id}
                      className={`match-post-option${selectedPostId === post._id ? " selected" : ""}`}
                      onClick={() => setSelectedPostId(post._id)}
                    >
                      <strong>{post.parkingStructure}</strong>
                      {post.schedule?.map((item, i) => (
                        <span key={i}>{item.day}: {item.startTime} – {item.endTime}</span>
                      ))}
                    </button>
                  ))}
                </div>

                <div className="match-modal-actions">
                  <Button disabled={!selectedPostId} onClick={runMatch}>Continue</Button>
                  <Button variant="secondary" onClick={() => setMatchModal(null)}>Cancel</Button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default BrowsePosts;