

export default function useLoginApi() {

    const apiUrl = process.env.REACT_APP_API_URL;
    const loginUser = async (email, password) => {
        try {
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (res.ok) {
                return { success: true, data };
            } else {
                return {
                    success: false,
                    error: data.message || "login_failed",
                    status: res.status
                };
            }
        } catch (error) {
            return { success: false, error: "server_error" };
        }
    };

    const requestPasswordReset = async (email) => {
        try {
            const res = await fetch(`${apiUrl}/auth/request-password-reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            return {
                success: res.ok,
                message: data.message || (res.ok ? "reset_email_sent" : "reset_email_error")
            };
        } catch (error) {
            return { success: false, message: "reset_email_error" };
        }
    };

    return { loginUser, requestPasswordReset };
}
