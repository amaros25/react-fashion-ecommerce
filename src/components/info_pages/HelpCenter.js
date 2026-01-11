import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPaperPlane, FaBox, FaTshirt, FaComments } from "react-icons/fa";
import { fetchOrderByNumber } from "../chat/chat_api";
import "./HelpCenter.css";
import { useLocation } from "react-router-dom";

const HelpCenter = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role"); // 1 = User / Buyer, 2 = Seller
    const token = localStorage.getItem("token");

    const [activeTab, setActiveTab] = useState(0); // 0: Order, 1: Product, 2: Chat
    const [form, setForm] = useState({
        message: "",
        productNumber: "",
        orderNumber: location.state?.orderNumber || ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleTabClick = (index) => {
        setActiveTab(index);
        // Clear fields when switching? Optional.
        // setForm({ message: "", productNumber: "", orderNumber: "" }); 
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        // This functionality might be redundant now if tabs 1 & 2 also just lead to chat or some other action.
        // The prompt says: "tabs hilfe bei Bestellung dann muss der Nutzer nur die Bestellung Nummer eingeben..."
        // It implies different inputs per tab.
        // "wenn es um product geht dann andere Tab dann nur Product number"
        // "bei dem dritten sollte für den Nutzer sofort ein chat geöffnet..."

        // For Tab 0 and 1, maybe we still submit a message? Or just open a chat with that reference?
        // "Order Number" input -> what happens? 
        // Let's assume it starts a chat referencing that Order/Product same as before but simpler UI.

        if (!form.message) {
            toast.error(t("help_center.message_required") || "Please enter your message.");
            return;
        }

        if (activeTab === 0 && !form.orderNumber) {
            toast.error(t("help_center.order_required") || "Please enter Order Number.");
            return;
        }
        if (activeTab === 1 && !form.productNumber) {
            toast.error(t("help_center.product_required") || "Please enter Product Number.");
            return;
        }

        // Use existing logic for submission if logged in
        if (!userId) {
            toast.error(t("product_page.must_login") || "You must be logged in to send a request.");
            navigate("/login");
            return;
        }

        setLoading(true);

        try {
            // Validation Logic
            if (activeTab === 0 && form.orderNumber) {
                const orderRes = await fetchOrderByNumber(form.orderNumber, token);
                if (!orderRes.success) {
                    toast.error(t("help_center.unknown_number") || "Unknown Number");
                    setLoading(false);
                    return;
                }
            }

            if (activeTab === 1 && form.productNumber) {
                // Fetch product to validate existence
                const apiUrl = process.env.REACT_APP_API_URL;
                const productRes = await fetch(`${apiUrl}/products/${form.productNumber}`);
                if (!productRes.ok) {
                    toast.error(t("help_center.unknown_number") || "Unknown Number");
                    setLoading(false);
                    return;
                }
            }

            // If valid, navigate to chat
            navigate("/chat", {
                state: {
                    newChatType: activeTab === 0 ? "order" : "product",
                    newOrderNumber: activeTab === 0 ? form.orderNumber : form.productNumber,
                    message: form.message
                }
            });

        } catch (error) {
            console.error(error);
            toast.error("An error occurred. Please try again.");
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

            <div className="help-tabs">
                <div
                    className={`help-tab ${activeTab === 0 ? "active" : ""}`}
                    onClick={() => handleTabClick(0)}
                >
                    <FaBox /> {t("help_center.tab_order") || "Order Help"}
                </div>
                <div
                    className={`help-tab ${activeTab === 1 ? "active" : ""}`}
                    onClick={() => handleTabClick(1)}
                >
                    <FaTshirt /> {t("help_center.tab_product") || "Product Help"}
                </div>
            </div>

            <div className="contact-form-card">
                <form onSubmit={handleSubmit}>
                    {activeTab === 0 && (
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
                    )}

                    {activeTab === 1 && (
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
                    )}

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
