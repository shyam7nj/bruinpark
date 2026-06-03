import AppLayout from '../components/AppLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import '../styles/pageStyles/loginFailed.css';

function LoginFailed(){
  return(
    <AppLayout>
      <div className="login-failed-container">
        <Card className="login-failed-panel">
          <PageHeader
            label="Access Denied"
            title="Login Failed"
            description="BruinPark is only available to students with a valid UCLA Google account."
          />

          <p className="login-failed-help">
            Use an email ending in @ucla.edu or @g.ucla.edu, then try again.
          </p>

          <Button href="/" variant="secondary">
            Back to Home
          </Button>
        </Card>
      </div>
    </AppLayout>
  );
}

export default LoginFailed;