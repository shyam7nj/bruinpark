
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
    return apiRequest("/api/verify/pending");
}

export function approveVerification(userId){
    return apiRequest(`/api/verify/${userId}/approve`, {
        method: "PATCH"
    });
}

export function rejectVerification(userId, rejectionReason){
    return apiRequest(`/api/verify/${userId}/reject`, {
        method: "PATCH", 
        body: JSON.stringify({ rejectionReason })
    });
}