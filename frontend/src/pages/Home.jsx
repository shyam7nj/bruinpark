
import { API_URL } from '../api/client';
import AppLayout from '../components/AppLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

function Home(){
  return(
    <AppLayout>
      <PageHeader
        label="UCLA Commuter Parking"
        title="Find parking partners with compatible schedules"
        descrption="BruinPark helps UCLA commuter students connect with other each other to save money on parking permits."
        actions={
          <Button href={`${API_URL}/auth/google`}>
            Log in with Google
          </Button>
        }
      />

      <div className="home-grid">
        <Card>
          <h2>Create a post</h2>
          <p>
            Share your parking structure and weekly schedule so other commuters can find compatible matches.
          </p>
        </Card>

        <Card>
          <h2>Browse Matches</h2>
          <p>
            Filter posts by day and/or parking structure and look for students with parking needs that work with yours.
          </p>
        </Card>

        <Card>
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