

export default function useRegisterApi() {

    const registerUser = async (endpoint, payload) => {
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                return { success: true, userId: data.userId };
            } else {
                console.log("data.message: ", data.message);
                console.log("data: ", data);

                return { success: false, error: data.message, userId: null };
            }
        } catch (error) {
            return { success: false, error: error.message, userId: null };
        }
    };

    return { registerUser };
}
