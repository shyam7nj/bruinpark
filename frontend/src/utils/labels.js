
/*
    Shared display-label helper functions for the frontend pages
*/

export function getPostTypeLabel(postType){
    if(postType === "offering"){
        return "Offering parking permit";
    }
    return "Looking for parking permit";
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