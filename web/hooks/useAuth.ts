import { parseCookies } from "nookies";
import { useEffect, useState } from "react";

interface User {
    id: string;
    username: string;
    email: string;
    displayName: string;
}

export default function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        try {
            const cookies = parseCookies();
            const jwtToken = cookies.jwt;

            if(!jwtToken) {
                setLoading(false);
                return;
            }

            // Decode JWT token
            const base64Url = jwtToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );

            const userData = JSON.parse(jsonPayload);
            setUser(userData);
        }
        catch(err) {
            console.error("Error getting user from token: ", err);
        }
        finally {
            setLoading(false);
        }
    }, []);
    
    return { user, loading };
}