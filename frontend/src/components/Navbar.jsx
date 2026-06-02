
/*
    Reusable navigation bar for the top of the page. Keeps the main page links consistent throughout all pages.
*/

import { API_URL } from '../api/client';

function Navbar(){
    return(
        <header className="navbar">
            <a className="navbar-home-page" href="/">
                BruinPark
            </a>

            <nav className="navbar-links">
                <a href="/browse-posts">Browse Posts</a>
                <a href="/create-post">Create Post</a>
                <a href="/dashboard">Dashboard</a>
            </nav>

            <a className="navbar-login" href={`${API_URL}/auth/google`}>
                Sign In
            </a>
        </header>
    );
}

export default Navbar;