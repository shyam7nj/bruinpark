
import { API_URL } from '../api/client';
import AppLayout from '../components/AppLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import '../styles/pageStyles/home.css';

function Home(){
  return(
    <AppLayout>
      <section className="home-page-header">
        <PageHeader
          label="For UCLA Commuters"
          title="BruinPark"
          description="Find commuter students with compatible parking schedules, create and browse parking posts, and send message requests when you find a possible match."      
          actions={
            <Button href={`${API_URL}/auth/google`} variant="secondary">
              Log in with Google
            </Button>
          }
        />
      </section>

      <div className="home-grid">
        <Card className="home-info-card">
          <h2>Create a post</h2>
          <p>
            Share your parking structure and weekly schedule so other commuters can find compatible matches.
          </p>
        </Card>

        <Card className="home-info-card">
          <h2>Browse Matches</h2>
          <p>
            Filter posts by day and/or parking structure and look for students with parking needs that work with yours.
          </p>
        </Card>

        <Card className="home-info-card">
          <h2>Request Contact</h2>
          <p>
            Send a message request first, then continue the conversation only after the other student accepts.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}

export default Home;