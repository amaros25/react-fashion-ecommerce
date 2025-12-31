import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPaperPlane } from "react-icons/fa";
import "./HelpCenter.css";

const HelpCenter = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role"); // 1 = User / Buyer, 2 = Seller
    const token = localStorage.getItem("token");
    console.log("userId: ", userId);
    console.log("role: ", role);
    console.log("token: ", token);
    const [form, setForm] = useState({
        message: "",
        productNumber: "",
        orderNumber: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId || !token) {
            toast.error(t("product_page.must_login") || "You must be logged in to send a message.");
            navigate("/login");
            return;
        }

        if (!form.message) {
            toast.error(t("help_center.message_required") || "Please enter your message.");
            return;
        }

        if (!form.orderNumber && !form.productNumber) {
            toast.error(t("help_center.order_or_product_required") || "Please enter either an Order Number or a Product Number.");
            return;
        }


        // Must have either Product Number or Order Number or we generate one (handled in backend if null)
        // But the prompt says: "muss pflicht dass der Nutzer entweder Product Number doer Order Numer eingibt sonst wird eine neue Number erzeugt"
        // Wait, "muss pflicht... sonst wird eine neue Number erzeugt". 
        // "sonst" usually means "otherwise". 
        // Actually, "muss pflicht" means "mandatory", but then "sonst wird eine neue...erstellt" 
        // means if he doesn't, we generate one. 

        setLoading(true);
        try {
            // 1. Create the Chat
            let sellerId_ = "admin";
            let userId_ = "admin";
            console.log("role: ", role);
            if (role === "shoper") {
                sellerId_ = "admin";
                userId_ = userId;
            } else {
                sellerId_ = userId;
                userId_ = "admin";
            }
            console.log("sellerId_: ", sellerId_);
            console.log("userId_: ", userId_);
            const chatRes = await fetch(`${apiUrl}/chats/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: userId_,
                    sellerId: sellerId_,
                    type: "help",
                    number: form.orderNumber || form.productNumber || null
                })
            });

            if (!chatRes.ok) throw new Error("Failed to create chat");
            const chatData = await chatRes.json();

            // 2. Send the Message
            const msgRes = await fetch(`${apiUrl}/chats/${chatData._id}/message`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    senderId: userId,
                    text: form.message
                })
            });

            if (!msgRes.ok) throw new Error("Failed to send message");

            toast.success(t("help_center.success_msg") || "Your message has been sent to our support team.");
            navigate("/chat");
        } catch (err) {
            console.error(err);
            toast.error(t("help_center.error_msg") || "Failed to send message. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const dir = i18n.language === "ar" ? "rtl" : "ltr";

    return (
        <div className="help-center-container" dir={dir}>
            <div className="help-center-header">
                <h1>{t("help_center.title") || "HELP CENTER"}</h1>
                <p>{t("help_center.subtitle") || "How can we help you today?"}</p>
            </div>

            <div className="contact-form-card">
                <form onSubmit={handleSubmit}>
                    <div className="help-form-group">
                        <label>{t("help_center.order_number") || "Order Number"}</label>
                        <input
                            type="text"
                            name="orderNumber"
                            value={form.orderNumber}
                            onChange={handleChange}
                            placeholder={t("help_center.order_placeholder") || "Enter Order Number"}
                        />
                    </div>

                    <div className="help-form-group">
                        <label>{t("help_center.product_number") || "Product Number"}</label>
                        <input
                            type="text"
                            name="productNumber"
                            value={form.productNumber}
                            onChange={handleChange}
                            placeholder={t("help_center.product_placeholder") || "Enter Product Number"}
                        />
                    </div>

                    <div className="help-form-group">
                        <label>{t("help_center.message") || "Your Message"}</label>
                        <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            placeholder={t("help_center.message_placeholder") || "How can we help you?"}
                            required
                        />
                    </div>

                    <button type="submit" className="form-submit-btn" disabled={loading}>
                        {loading ? "..." : (
                            <>
                                <FaPaperPlane /> {t("help_center.send") || "SEND REQUEST"}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default HelpCenter;
