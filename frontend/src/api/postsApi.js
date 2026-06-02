
/*
    Frontend API functions for parking post backend routes.
    Centralizes:
    -   Posting
    -   Fetching posts
    -   Creating & Editing posts
    -   Deleting posts
*/

import { apiRequest } from "./client";

export function getPosts(){
    return apiRequest("/api/posts");
}

export function getUserPosts(){
    return apiRequest("/api/posts/mine");
}

export function createPost(postData){
    return apiRequest("/api/posts", {
        method: "POST",
        body: JSON.stringify(postData)
    });
}

export function editPost(postId, postData){
    return apiRequest(`/api/posts/${postId}`, {
        method: "PATCH",
        body: JSON.stringify(postData)
    });
}

export function deletePost(postId){
    return apiRequest(`/api/posts/${postId}`, {
        method: "DELETE",
    });
}