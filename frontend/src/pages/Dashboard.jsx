
import {useEffect, useState} from 'react';

const API_URL = "http://localhost:3001";

function Dashboard(){
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Loading");

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    }).then(async (response) => {
      if(!response.ok){
        throw new Error("Not Logged In");
      }

      const data = await response.json();
      setUser(data);
      setStatus("Authenticated");
    }).catch(() => {
      setStatus("Unauthenticated");
    });
  }, []);

  if(status === "Loading"){
    return(
      <main className="dashboard-page">
        <div className="dashboard-card">
          <p>Loading Dashboard, hang tight...</p>
        </div>
      </main>
    );
  }

  if(status === "Unauthenticated"){
    return(
      <main className="dashboard-page">
        <div className="dashboard-card">
          <h1>Not Logged In</h1>
          <p>You need to login with your UCLA Google account before viewing your dashboard.</p>

          <a className="home-login-button" href={`${API_URL}/auth/google`}>
            Log in with Google
          </a>
        </div>
      </main>
    );
  }


  return(
    <main className="dashboard-page">
      <div className="dashboard-card">
        <h1>Dashboard</h1>

        <p>Welcome to your Dashboard, {user.name}.</p>
        <p>Email: {user.email}</p>
      </div>
    </main>
  );
}

export default Dashboard;