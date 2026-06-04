import './App.css';

import Home from './pages/Home';
import LoginFailed from './pages/LoginFailed';
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import BrowsePosts from './pages/BrowsePosts';
import Verify from './pages/Verify';
import AdminVerify from './pages/AdminVerify';

// Maps URL paths to page components. To add a new route, add an entry here.
const ROUTES = {
  '/dashboard':    Dashboard,
  '/login-failed': LoginFailed,
  '/create-post':  CreatePost,
  '/browse-posts': BrowsePosts,
  '/verify':       Verify,
  '/admin/verify': AdminVerify,
};

function App() {
  const Page = ROUTES[window.location.pathname] ?? Home;
  return <Page />;
}

export default App;