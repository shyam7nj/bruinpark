
import {useState, useEffect} from 'react';
import { API_URL } from '../api/client';
import { getPendingVerifications, approveVerification, rejectVerification } from '../api/verifyApi';

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

    function getFileName(imagePath){
        if(!imagePath){
            return "";
        }
        return imagePath.split('/').pop();
    }

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
        <main className="admin-verify-page">
            <div className="admin-verify-card">
                <h1>Permit Verification Review</h1>

                <p>Review pending permit screenshots and approve or reject each user.</p>

                {message && <p className="verify-message">{message}</p>}

                <div className="admin-verification-list">
                    {pendingUsers.map((pendingUser) => {
                        const fileName = getFileName(pendingUser.verificationImagePath);
                        
                        return(
                            <div className="admin-verification-item" key={pendingUser._id}>
                                <h2>{pendingUser.name}</h2>

                                <p>Email: {pendingUser.email}</p>
                                <p> Status: {pendingUser.verificationStatus}</p>

                                {pendingUser.verificationSubmitDate && (
                                    <p> Submitted: {new Date(pendingUser.verificationSubmitDate).toLocaleString()}</p>
                                )}

                                {fileName && (
                                    <img className="verification-review" src={`${API_URL}/api/verify/file/${fileName}`} alt={`Permit verification submitted by ${pendingUser.name}`}/>
                                )}

                                <label className="post-edit-label">
                                    Rejection Reason
                                    <textarea value={rejectReason[pendingUser._id || ""]} onChange={(event) => setRejectReason({
                                        ...rejectReason,
                                        [pendingUser._id]: event.target.value,
                                    })}
                                    placeholder="Optional reason to include if rejecting this submission" />
                                </label>

                                <div className="post-card-actions">
                                    <button className="home-login-button" onClick={() => approveUser(pendingUser._id)}>
                                        Approve
                                    </button>

                                    <button className="dashboard-logout-button" onClick={() => rejectUser(pendingUser._id)}>
                                        Reject
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <a className="dashboard-logout-button" href="/dashboard">
                    Back to Dashboard 
                </a>
            </div>
        </main>
    );
}

export default AdminVerify;