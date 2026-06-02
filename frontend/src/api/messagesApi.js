
/*
    Frontend API functions for message request backend routes
*/

import { apiRequest } from "./client";

export function createMessageRequest(requestData){
    return apiRequest("/api/messages", {
        method: "POST",
        body: JSON.stringify(requestData)
    });
}

export function getIncomingMessageRequests(){
    return apiRequest("/api/messages/incoming");
}

export function getSentMessageRequests(){
    return apiRequest("api/messages/outgoing");
}

export function reviewMessageRequest(requestId, action){
    return apiRequest(`/api/messages/${requestId}/${action}`, {
        method: "PATCH"
    });
}