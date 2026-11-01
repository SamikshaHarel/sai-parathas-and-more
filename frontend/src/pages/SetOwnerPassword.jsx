
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SetOwnerPassword.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function SetOwnerPassword() {
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API}/api/auth/set-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        password,
                        confirmPassword,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to set password."
                );
            }

            setSuccess("Password set successfully.");

            setTimeout(() => {
                navigate("/owner-admin");
            }, 800);

        } catch (err) {
            console.error(err);
            setError(
                err.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="set-password-page">

            <div className="set-password-card">

                <div className="set-password-brand">
                    <div className="set-password-icon">
                        🍽️
                    </div>

                    <div>
                        <h1>Sai Parathas</h1>
                        <span>& More</span>
                    </div>
                </div>

                <div className="set-password-heading">
                    <p>FIRST-TIME SETUP</p>

                    <h2>Set your password</h2>

                    <span>
                        Create a private password for your
                        restaurant management account.
                    </span>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="set-password-field">
                        <label htmlFor="new-password">
                            New Password
                        </label>

                        <input
                            id="new-password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Enter new password"
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="set-password-field">
                        <label htmlFor="confirm-password">
                            Confirm Password
                        </label>

                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            placeholder="Re-enter new password"
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="password-requirement">
                        Minimum 8 characters
                    </div>

                    {error && (
                        <div className="set-password-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="set-password-success">
                            {success}
                        </div>
                    )}

                    <button
                        className="set-password-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : "Set Password"}
                    </button>

                </form>

                <p className="set-password-footer">
                    Keep your password private.
                </p>

            </div>

        </div>
    );
}

export default SetOwnerPassword;
