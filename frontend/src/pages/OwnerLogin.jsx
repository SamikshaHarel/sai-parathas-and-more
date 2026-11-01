
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OwnerLogin.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function OwnerLogin() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (event) => {
        event.preventDefault();

        if (!username.trim() || !password) {
            setError("Please enter username and password.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        username: username.trim(),
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Invalid username or password."
                );
            }

            if (data.role !== "ROLE_OWNER") {

                await fetch(
                    `${API}/api/auth/logout`,
                    {
                        method: "POST",
                        credentials: "include",
                    }
                );

                throw new Error(
                    "This login is only for the restaurant owner."
                );
            }

            /*
             * First-time owner:
             * The backend tells us that the password
             * still needs to be configured.
             */
            if (data.passwordSet === false) {
                navigate("/set-owner-password");
                return;
            }

            /*
             * Returning owner:
             * Password has already been configured.
             */
            navigate("/owner-admin");

        } catch (err) {
            console.error(err);

            setError(
                err.message ||
                "Login failed."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="owner-login-page">

            <div className="owner-login-card">

                <div className="owner-login-brand">

                    <div className="owner-login-icon">
                        🍽️
                    </div>

                    <div>
                        <h1>Sai Parathas</h1>
                        <span>& More</span>
                    </div>

                </div>

                <div className="owner-login-heading">

                    <p>OWNER PANEL</p>

                    <h2>Welcome back</h2>

                    <span>
                        Sign in to manage your restaurant.
                    </span>

                </div>

                <form onSubmit={handleLogin}>

                    <div className="login-field">

                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            placeholder="Enter username"
                            autoComplete="username"
                        />

                    </div>

                    <div className="login-field">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Enter password"
                            autoComplete="current-password"
                        />

                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button
                        className="owner-login-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign In"}
                    </button>

                </form>

                <p className="owner-login-footer">
                    Restaurant management access only
                </p>

            </div>

        </div>
    );
}

export default OwnerLogin;
