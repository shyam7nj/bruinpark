
/*
    Frontend API functions for authentication-related backend routes
*/

import { apiRequest } from "./client";

export function getCurrentUser(){
    return apiRequest("/auth/me");
}

export function logoutCurrentUser(){
    return apiRequest("/auth/logout", {
        method: "POST"   
    });
}

