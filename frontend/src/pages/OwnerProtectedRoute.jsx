
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function OwnerProtectedRoute({ children }) {
    const [checking, setChecking] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch(
                    `${API}/api/auth/me`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    setAuthenticated(false);
                    return;
                }

                const data = await response.json();

                setAuthenticated(
                    data.authenticated === true &&
                    data.role === "ROLE_OWNER"
                );

            } catch (error) {
                console.error(
                    "Authentication check failed:",
                    error
                );

                setAuthenticated(false);

            } finally {
                setChecking(false);
            }
        };

        checkSession();
    }, []);

    if (checking) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                    fontFamily: "Arial, sans-serif",
                }}
            >
                Checking authentication...
            </div>
        );
    }

    if (!authenticated) {
        return <Navigate to="/owner-login" replace />;
    }

    return children;
}

export default OwnerProtectedRoute;
