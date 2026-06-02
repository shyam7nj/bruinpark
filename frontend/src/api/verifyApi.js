
/*
    Frontend API functions for permit verification backend routes
*/

import { API_URL, apiRequest } from "./client";

export async function submitPermitVerification(formData){
    const response = await fetch(`${API_URL}/api/verify/submit`, {
        method: "POST", 
        credentials: "include", 
        body: formData
    });

    const data = await response.json().catch(() => null);
    if(!response.ok){
        throw new Error(data?.error || "Failed to submit permit verification");
    }
    return data;
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