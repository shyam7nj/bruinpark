
/*
    Frontend API functions for permit verification backend routes
*/

import { apiRequest } from "./client";

// Refactor: replaced manual fetch/JSON/error logic with apiRequest — FormData is safe to pass
// directly since apiRequest only sets Content-Type: application/json when body is a string.
export function submitPermitVerification(formData){
    return apiRequest("/api/verify/submit", { method: "POST", body: formData });
}

export function getPendingVerifications(){
    return apiRequest("/api/verify/pending", {}, "Failed to load pending verifications.");
}

export function approveVerification(userId){
    return apiRequest(`/api/verify/${userId}/approve`, {
        method: "PATCH"
    }, "Failed to approve verification.");
}

export function rejectVerification(userId, reason){
    return apiRequest(`/api/verify/${userId}/reject`, {
        method: "PATCH", 
        body: JSON.stringify({ reason })
    }, "Failed to reject verification.");
}