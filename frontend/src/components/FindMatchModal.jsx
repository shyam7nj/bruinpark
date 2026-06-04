
import Button from './Button';
import { getPostTypeLabel } from '../utils/labels';

/* FindMatchModal shown when the user clicks "Find Potential Match" on BrowsePosts. */

function FindMatchModal({ matchModal, myPosts, selectedPostId, setSelectedPostId, closeMatchModal }) {
  if (!matchModal) return null;

  return (
    <div className="match-modal-backdrop" onClick={closeMatchModal}>
      <div className="match-modal" onClick={(e) => e.stopPropagation()}>

        {matchModal === 'loading' && (
          <p className="match-modal-body">Looking up your posts…</p>
        )}

        {/*if User has no posts yet, redirect them*/}
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
              <Button type="button" variant="secondary" onClick={closeMatchModal}>
                Cancel
              </Button>
            </div>
          </>
        )}

        {/*if user has posts, let them pick which one to match on*/}
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
              {/*continue is a placeholder*/}
              <Button type="button" disabled={!selectedPostId}>
                Continue
              </Button>
              <Button type="button" variant="secondary" onClick={closeMatchModal}>
                Cancel
              </Button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default FindMatchModal;
