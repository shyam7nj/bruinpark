import './App.css';

import Home from './pages/Home';
import LoginFailed from './pages/LoginFailed';
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import BrowsePosts from './pages/BrowsePosts';
import Verify from './pages/Verify';
import AdminVerify from './pages/AdminVerify';

function App() {
  const path = window.location.pathname;

  if (path === '/dashboard') {
    return <Dashboard />;
  }

  if (path === '/login-failed') {
    return <LoginFailed />;
  }

  if (path === '/create-post') {
    return <CreatePost />;
  }

  if (path === '/browse-posts') {
    return <BrowsePosts />;
  }

  if (path === '/verify'){
    return <Verify />;
  }

  if (path === '/admin/verify'){
    return <AdminVerify />;
  }

  return <Home />;
}

export default App;