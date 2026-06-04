
/*
    Shared display-label helper functions for the frontend pages
*/

// Refactor: replaced if-statement with a lookup table — add new post types here as a single entry.
const POST_TYPE_LABELS = {
    offering: "Offering parking permit",
    looking:  "Looking for parking permit",
};

export function getPostTypeLabel(postType){
    return POST_TYPE_LABELS[postType] ?? "Looking for parking permit";
}

export function getVerificationMessage(user){
    if(user?.verificationStatus === "verified"){
        return "Your parking permit has been verified.";
    }

    if(user?.verificationStatus === "pending"){
        return "Your parking permit verification is pending admin review.";
    }

    if(user?.verificationStatus === "rejected"){
        return user.verificationRejectionReason || "Your permit verification was rejected. Please upload a new screenshot.";
    }
    return "You have not verified your parking permit yet.";
}