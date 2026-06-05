
import { useState } from 'react';
import Button from './Button';
import Badge from './Badge';
import { getPostTypeLabel } from '../utils/labels';
import { createMessageRequest } from '../api/messagesApi';

/* helper: db "HH:MM" transformed to minutes since midnight0*/
function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/*
 * Returns total overlapping minutes between two post schedules.
 * Skips a day early when either side has no entry — handles the
 * day-level check without a separate pass.
 */
function computeOverlapMinutes(scheduleA, scheduleB) {
  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  let total = 0;
  for (const day of DAYS) {
    /* O(1) if no overlapping days */
    const as = scheduleA.filter(s => s.day === day);
    if (as.length === 0) continue;
    const bs = scheduleB.filter(s => s.day === day);
    if (bs.length === 0) continue;
    for (const a of as){
      const aStart = timeToMinutes(a.startTime);
      const aEnd = timeToMinutes(a.endTime);
      for (const b of bs) {
        /* calculating overlap entry by entry */
        const start = Math.max(aStart, timeToMinutes(b.startTime));
        const end = Math.min(aEnd, timeToMinutes(b.endTime));
        if (end > start) total += end - start;
      }
    }
  }
  return total;
}

/* FindMatchModal: find available post to match, match, show result */
function FindMatchModal({ matchModal, myPosts, selectedPostId, setSelectedPostId, closeMatchModal, posts }) {
  //null = not yet run; {fromPost, list: [{post, overlapMinutes}]} to display results
  const [results, setResults] = useState(null);
  const [activeReqId, setActiveReqId] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [msgStatus, setMsgStatus] = useState({});

  if (!matchModal) return null;

  function runMatch() {
    const fromPost = myPosts.find(p => p._id === selectedPostId);
    if (!fromPost) return;

    //filter out own posts; only consider the complementary post type
    const ownIds = new Set(myPosts.map(p => p._id));
    const oppositeType = fromPost.postType === 'looking' ? 'offering' : 'looking';
    const candidates = posts.filter(p => p.postType === oppositeType && !ownIds.has(p._id));

    //calc. overlapping minutes w/ help func above
    const scored = candidates.map(post => ({
      post,
      overlapMinutes: computeOverlapMinutes(fromPost.schedule, post.schedule),
    }));

    // display perfect matches, then display top 5 w/ least overlaps
    const perfect = scored.filter(s => s.overlapMinutes === 0);
    const partial  = scored
      .filter(s => s.overlapMinutes > 0)
      .sort((a, b) => a.overlapMinutes - b.overlapMinutes);

    setResults({ fromPost, list: [...perfect, ...partial].slice(0, 5) });
  }

  async function sendRequest(postId) {
    try {
      await createMessageRequest({ postId, message: msgText });
      setMsgStatus(prev => ({ ...prev, [postId]: 'Message request sent.' }));
      setActiveReqId(null);
      setMsgText('');
    } catch (err) {
      setMsgStatus(prev => ({ ...prev, [postId]: err.message || 'Failed to send.' }));
    }
  }

  /*reset internal state when modal closed*/
  function handleClose() {
    setResults(null);
    setActiveReqId(null);
    setMsgText('');
    setMsgStatus({});
    closeMatchModal();
  }

  return (
    <div className="match-modal-backdrop" onClick={handleClose}>
      {/*match-modal defined below*/}
      <div
        className={`match-modal${results ? ' match-modal--wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >

        {results !== null ? (
          /* after continue: results view */
          <>
            <div className="match-modal-results-header">
              <div>
                <h2 className="match-modal-title">Top Matches</h2>
                <p className="match-modal-body">
                  Based on your <strong>{results.fromPost.parkingStructure}</strong> post.
                  {results.list.length === 0
                    ? ' No compatible matches found yet — check back later.'
                    : ` ${results.list.length} result${results.list.length > 1 ? 's' : ''}, best first.`}
                </p>
              </div>
              <Button variant="secondary" onClick={() => setResults(null)}>← Back</Button>
            </div>

            {results.list.length === 0 ? (
              <p className="match-modal-body">
                Try creating a post with different days or structures.
              </p>
            ) : (
              <div className="match-modal-result-list">
                {results.list.map(({ post, overlapMinutes }) => (
                  <div className="match-modal-result-card" key={post._id}>
                    <div className="match-modal-result-header">
                      <div>
                        <strong>{post.parkingStructure}</strong>
                        <span className="match-modal-post-type">
                          Posted by {post.owner?.name || 'Unknown'}
                        </span>
                      </div>
                      <Badge variant={post.postType === 'offering' ? 'info' : 'warning'}>
                        {getPostTypeLabel(post.postType)}
                      </Badge>
                    </div>

                    {/*show of compatibility: green = perfect, yello = some overlap */}
                    <div className={`match-score ${overlapMinutes === 0 ? 'match-score-perfect' : 'match-score-partial'}`}>
                      {overlapMinutes === 0
                        ? 'Perfect match: no schedule conflict'
                        : `${overlapMinutes} min of schedule overlap`}
                    </div>

                    <div className="match-modal-result-schedule">
                      {post.schedule?.map((item, i) => (
                        <p key={i}><strong>{item.day}:</strong> {item.startTime} – {item.endTime}</p>
                      ))}
                    </div>

                    {post.notes && (
                      <p className="match-modal-post-type">{post.notes}</p>
                    )}

                    {activeReqId === post._id ? (
                      <>
                        <textarea
                          className="match-modal-msg-input"
                          value={msgText}
                          onChange={(e) => setMsgText(e.target.value)}
                          placeholder="Add a note for this person (optional)."
                        />
                        <div className="match-modal-actions">
                          <Button type="button" onClick={() => sendRequest(post._id)}>
                            Send Request
                          </Button>
                          <Button type="button" variant="secondary" onClick={() => { setActiveReqId(null); setMsgText(''); }}>
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <Button type="button" onClick={() => setActiveReqId(post._id)}>
                        Send Message Request
                      </Button>
                    )}

                    {msgStatus[post._id] && (
                      <p className="match-modal-msg-status">{msgStatus[post._id]}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="match-modal-actions">
              <Button variant="secondary" onClick={handleClose}>Close</Button>
            </div>
          </>
        ) : (
          /* before continue: loading / no-posts / select views*/
          <>
            {matchModal === 'loading' && (
              <p className="match-modal-body">Looking up your posts…</p>
            )}

            {matchModal === 'no-posts' && (
              <>
                <h2 className="match-modal-title">No Post Found</h2>
                <p className="match-modal-body">
                  You need an active parking post before we can find you a match.
                  Create one first and come back here!
                </p>
                <div className="match-modal-actions">
                  <Button type="button" onClick={() => { window.location.href = '/create-post'; }}>
                    Create a Post
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleClose}>
                    Cancel
                  </Button>
                </div>
              </>
            )}

            {matchModal === 'select' && (
              <>
                <h2 className="match-modal-title">Find a Match</h2>
                <p className="match-modal-body">
                  Select one of your posts below. We'll use it to find compatible matches.
                </p>
                <div className="match-modal-post-list">
                  {myPosts.map((post) => (
                    <label
                      key={post._id}
                      className={`match-modal-post-option${selectedPostId === post._id ? ' selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="matchPost"
                        value={post._id}
                        checked={selectedPostId === post._id}
                        onChange={() => setSelectedPostId(post._id)}
                      />
                      <span className="match-modal-post-info">
                        <strong>{post.parkingStructure}</strong>
                        <span className="match-modal-post-type">{getPostTypeLabel(post.postType)}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="match-modal-actions">
                  <Button type="button" disabled={!selectedPostId} onClick={runMatch}>
                    Continue
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleClose}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default FindMatchModal;
