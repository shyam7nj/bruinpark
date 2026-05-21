
function LoginFailed(){
  return(
    <main className="login-failed-page">
      <div className="login-failed-card">
        <h1>Login Failed</h1>
        <p>
          BruinPark is only available to students with a valid UCLA Google account. Please
          login with your UCLA Google account. 
        </p>

        <p className="login-failed-help">
          Use an email ending in @ucla.edu or @g.ucla.edu.
        </p>

        <a className="home-login-failed" href="/">
          Back to Home
        </a>

      </div>
    </main>
  );
}

export default LoginFailed;