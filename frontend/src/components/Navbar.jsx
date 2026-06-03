
/*
    Reusable navigation bar for the top of the page. Keeps the main page links consistent throughout all pages.
*/

import { API_URL } from '../api/client';
import { logoutCurrentUser } from '../api/authApi';
import useCurrentUser from '../hooks/useCurrentUser';

function Navbar(){
    const {user, setUser} = useCurrentUser();

    async function logout(){
        await logoutCurrentUser();
        setUser(null);
        window.location.href = "/";
    }

    return(
        <header className="navbar">
            <a className="navbar-home-page" href="/">
                BruinPark
            </a>

            <nav className="navbar-links">
                {user && (
                    <>
                        <a href="/browse-posts">Browse Posts</a>
                        <a href="/create-post">Create Post</a>
                        <a href="/dashboard">Dashboard</a>
                    </>
                )}
            </nav>

            {user ? (
                <button className="navbar-login" type="button" onClick={logout}>
                    Log Out
                </button>
            ) : (
                <a className="navbar-login" href={`${API_URL}/auth/google`}>
                    Sign In
                </a>
            )}
        </header>
    );
}

export default Navbar;