
import {useState} from 'react';
import {API_URL} from '../api/client';
import { submitPermitVerification } from '../api/verifyApi';
import useCurrentUser from '../hooks/useCurrentUser';

import AppLayout from '../components/AppLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import '../styles/pageStyles/verify.css';

function Verify(){
    const [permitImage, setPermitImage] = useState(null);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {status} = useCurrentUser();

    async function submitVerification(event){
        event.preventDefault();

        if(!permitImage){
            setMessage("Please upload a permit confirmation screenshot.");
            return;
        }

        setIsSubmitting(true);
        setMessage("");

        const formData = new FormData();
        formData.append('permitImage', permitImage);

        try{
            const data = await submitPermitVerification(formData);
            setMessage(data.message || "Permit Verification submitted for review.");
            setPermitImage(null);
        }
        catch(err){
            setMessage(err.message);
        }
        finally{
            setIsSubmitting(false);
        }
    }

    if(status === "Loading"){
        return(
            <AppLayout>
                <Card className="verify-status-card">
                    <p>Loading verification page...</p>
                </Card>
            </AppLayout>
        );
    }

    if(status === "Unauthenticated"){
        return(
            <AppLayout>
                <Card className="verify-status-card">
                    <PageHeader
                        label="Login required"
                        title="Verify your permit"
                        description="You need to log in with your UCLA Google account before submitting a permit to be verified."
                        actions={
                            <Button href={`${API_URL}/auth/google`}>
                                Log in with Google
                            </Button>
                        }
                    />
                </Card>
            </AppLayout>
        );
    }

    return(
        <AppLayout>
            <PageHeader
                label="Permit Verification"
                title="Verify your parking permit"
                description="Upload a screenshot of your UCLA permit confirmation email so an admin can review your account."
            />

            <div className="verify-layout">
                <Card className="verify-form-card">
                    <form className="verify-form" onSubmit={submitVerification}>
                        <label>
                            Permit Confirmation Screenshot
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={(event) => setPermitImage(event.target.files[0])}
                            />
                        </label>

                        <div className="verify-actions">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Submit for Review"}
                            </Button>

                            <Button href="/dashboard" variant="secondary">
                                Back to Dashboard
                            </Button>
                        </div>

                        {message && (
                            <p className="verify-message">{message}</p>
                        )}
                    </form>
                </Card>
                
                <Card className="verify-instructions-card">
                    <h2>Screenshot Requirements:</h2>
                    <ul>
                        <li>Show the full confirmation email in one screenshot.</li>
                        <li>Include the date and time the email was sent.</li>
                        <li>Show confirmation that the parking permit was purchased.</li>
                        <li>Do not crop out important email details.</li>
                    </ul>

                </Card>
            </div>
        </AppLayout>
    );
}

export default Verify;