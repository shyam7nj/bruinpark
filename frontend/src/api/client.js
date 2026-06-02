
/*
    Frontend helper file for making requests to the backend
    -   Centralized API url
    -   Parses JSON response and returns backend errors
*/

const API_URL = "http://localhost:3001";

export async function apiRequest(path, requestOptions = {}, backupErrorMessage = "Request Failed"){
    const response = await fetch(`${API_URL}${path}`, {
        credentials: 'include',
        ...requestOptions,
        headers: {
            ...(requestOptions.body ? {"Content-Type": "application/json"} : {}),
            ...requestOptions.headers,
        },
    });

    const data = await response.json().catch(() => null);
    if(!response.ok){
        throw new Error(data?.error || backupErrorMessage);
    }
    return data;
}

export {
    API_URL
};