
/*
    Shared layout wrapper for pages. Adds the Navbar
*/

import Navbar from './Navbar';


function AppLayout({children}){
    return(
        <div className="app-shell">
            <Navbar />

            <main className="app-main">
                {children}
            </main>
        </div>
    );
}

export default AppLayout;