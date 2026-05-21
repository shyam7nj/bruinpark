import PageLayout from '../components/PageLayout';

function LoginFailed() {
  return (
    <PageLayout>
      <h1>Login Failed</h1>

      <p>Use a valid UCLA email address to successfully sign up.</p>

      <a className="button secondary" href="/">
        Back to home
      </a>
    </PageLayout>
  );
}

export default LoginFailed;