import { useEffect, useState } from 'react';
import { getCurrentUser } from '../api/authApi';

function useCurrentUser(){
    const [user, setUser] = useState(null);
    const [status, setStatus] = useState("Loading");

    useEffect(() => {
        getCurrentUser().then((data) => {
            setUser(data);
            setStatus("Authenticated");
        }).catch(() => {
            setUser(null);
            setStatus("Unauthenticated");
        });
    }, []);

    return { user, status, setUser };
}

export default useCurrentUser;