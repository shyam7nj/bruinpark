function NavigationBar() {
  return (
    <nav className="navbar">
      <a className="navbar-brand" href="/">
        BruinPark
      </a>

      <div className="navbar-links">
        <a href="/dashboard">Dashboard</a>
        <a href="/create-post">Create Post</a>
        <a href="/browse-posts">Browse Posts</a>
      </div>
    </nav>
  );
}

export default NavigationBar;