
import {useState, useEffect} from 'react';
import { API_URL } from '../api/client';
import { getPendingVerifications, approveVerification, rejectVerification } from '../api/verifyApi';

// Refactor: imported shared components to replace raw elements with ad-hoc classnames,
// keeping AdminVerify consistent with every other page in the app.
import AppLayout from '../components/AppLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

function AdminVerify(){
    const [pendingUsers, setPendingUsers] = useState([]);
    const [message, setMessage] = useState("Loading pending verification...");
    const [rejectReason, setRejectReason] = useState({});

    async function fetchPendingUsers(){
        try{
            const data = await getPendingVerifications();
            setPendingUsers(data);
            setMessage(data.length === 0 ? "No pending permit verifications." : "");
        }
        catch(err){
            setMessage(err.message);
        }
    }
    
    useEffect(() => {
        fetchPendingUsers();
    }, []);

    async function approveUser(userId){
        try{
            const data = await approveVerification(userId);
            setMessage(data.message);
            setPendingUsers(pendingUsers.filter((user) => user._id !== userId));
        }
        catch(err){
            setMessage(err.message);
        }
    }


    async function rejectUser(userId){
        try{
            const reason = rejectReason[userId] || "Permit Verification was rejected.";
            const data = await rejectVerification(userId, reason);

            setMessage(data.message);
            setPendingUsers(pendingUsers.filter((user) => user._id !== userId));
        }
        catch(err){
            setMessage(err.message);
        }
    }

    return(
        <AppLayout>
            <PageHeader
                label="Admin"
                title="Permit Verification Review"
                description="Review pending permit screenshots and approve or reject each user."
            />

            <Card className="admin-verify-card">
                {message && <p className="verify-message">{message}</p>}

                <div className="admin-verification-list">
                    {pendingUsers.map((pendingUser) => {
                        // Refactor: inlined getFileName — it was a one-liner used in one place,
                        // optional chaining handles the null case cleanly without a helper function.
                        const fileName = pendingUser.verificationImagePath?.split('/').pop() ?? "";

                        return(
                            <div className="admin-verification-item" key={pendingUser._id}>
                                <h2>{pendingUser.name}</h2>

                                <p>Email: {pendingUser.email}</p>
                                <p>Status: {pendingUser.verificationStatus}</p>

                                {pendingUser.verificationSubmitDate && (
                                    <p>Submitted: {new Date(pendingUser.verificationSubmitDate).toLocaleString()}</p>
                                )}

                                {fileName && (
                                    <img className="verification-review" src={`${API_URL}/api/verify/file/${fileName}`} alt={`Permit verification submitted by ${pendingUser.name}`}/>
                                )}

                                <label className="post-edit-label">
                                    Rejection Reason
                                    <textarea value={rejectReason[pendingUser._id] || ""} onChange={(event) => setRejectReason({
                                        ...rejectReason,
                                        [pendingUser._id]: event.target.value,
                                    })}
                                    placeholder="Optional reason to include if rejecting this submission" />
                                </label>

                                <div className="post-card-actions">
                                    {/* Refactor: replaced raw <button> elements with shared Button component
                                        so styling is controlled centrally, not via ad-hoc classnames */}
                                    <Button type="button" onClick={() => approveUser(pendingUser._id)}>
                                        Approve
                                    </Button>

                                    <Button type="button" variant="danger" onClick={() => rejectUser(pendingUser._id)}>
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Refactor: replaced raw <a> with shared Button component for consistent link styling */}
                <Button href="/dashboard" variant="secondary">
                    Back to Dashboard
                </Button>
            </Card>
        </AppLayout>
    );
}

export default AdminVerify;