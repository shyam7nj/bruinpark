
import {useState} from 'react';

const API_URL = "http://localhost:3001";

function Verify(){
    const [permitImage, setPermitImage] = useState(null);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            const response = await fetch(`${API_URL}/api/verify/submit`,{
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const data = await response.json();

            if(!response.ok){
                throw new Error(data.error || "Failed to submit verification.");
            }

            setMessage(data.message || "Permit Verification submitted for review");
            setPermitImage(null);
        }
        catch(err){
            setMessage(err.message);
        }
        finally{
            setIsSubmitting(false);
        }
    }

    return(
        <main className="verify-page">
            <div className="verify-card">
                <h1>Verify Parking Permit</h1>

                <p>Upload a screenshot of your UCLA parking permit confirmation email.
                    An admin will manually review it before your account is verified.
                </p>

                <div className="verify-instructions">
                    <h2>Screenshot requirements:</h2>
                    <ul>
                        <li>Show full confirmation email in one screenshot</li>
                        <li>Include the date and time the email was sent</li>
                        <li>Show confirmation that the parking permit was purchased</li>
                        <li>Don't crop out any important email details or it won't be approved</li>
                    </ul>
                </div>

                <form className="verify-form" onSubmit={submitVerification}>
                    <label>
                        Permit Confirmation Screenshot
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={(event) => setPermitImage(event.target.files[0])}
                        />
                    </label>

                    <button className="home-login-button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit for Review"}
                    </button>
                </form>

                {message && <p className="verify-message">{message}</p>}

                <a className="dashboard-logout-button" href="/dashboard">
                    Back to Dashboard
                </a>
            </div>
        </main>
    );
}

export default Verify;