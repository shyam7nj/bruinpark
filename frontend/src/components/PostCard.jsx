function PostCard({ post }) {
  return (
    <article className="post-card">
      <h2>{post.parkingStructure}</h2>

      <p>Posted by: {post.owner?.name || 'Unknown user'}</p>

      <h3>Schedule</h3>

      {Object.entries(post.schedule).map(([day, blocks]) => (
        <p key={day}>
          <strong>{day}:</strong>{' '}
          {blocks.length > 0 ? blocks.join(', ') : 'none'}
        </p>
      ))}

      {post.notes && (
        <p>
          <strong>Notes:</strong> {post.notes}
        </p>
      )}
    </article>
  );
}

export default PostCard;