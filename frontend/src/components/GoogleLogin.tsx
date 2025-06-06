import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

interface GoogleCredentialResponse {
    credential: string
    selectBy: string
}

const GoogleLogin: React.FC = () => {
    const { loginGoogle } = useAuth()

    useEffect(() => {
        window.google?.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
        });

        window.google?.accounts.id.renderButton(
            document.getElementById("google-button")!,
            {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                width: "100%",
            }
        );
    }, []);

    async function handleCredentialResponse(response: GoogleCredentialResponse) {
        const idToken = response.credential

        loginGoogle( idToken )
    }

    return (
        <div id="google-button" className="w-full"></div>
    )
}

export default GoogleLogin