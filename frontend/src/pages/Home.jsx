const API_URL = 'http://localhost:3001';

function Home() {
  return (
    <main className="home-page page-enter">
      <div className="home-card">
        <h1 className="home-title">BruinPark</h1>

        <p className="home-description">
          Find parking partners with compatible UCLA schedules.
        </p>

        <p className="home-description">
          Create a parking post, browse other students, and find someone whose
          parking needs do not overlap with yours.
        </p>

        <a className="home-login-button" href={`${API_URL}/auth/google`}>
          Log in with Google
        </a>
      </div>
    </main>
  );
}

export default Home;