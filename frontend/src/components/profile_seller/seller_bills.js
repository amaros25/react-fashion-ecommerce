import React, { useState, useEffect } from "react";
import "./seller_bills.css";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../utils/loading_spinner";

/*function SellerBills({ sellerId, apiUrl, token }) {
    const { t } = useTranslation();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    useEffect(() => {
        const fetchBills = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${apiUrl}/sellers/${sellerId}/bills?page=${page}&limit=${limit}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setBills(data.bills);
                    setTotalPages(data.totalPages);
                }
            } catch (error) {
                console.error("Error fetching bills:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBills();
    }, [sellerId, apiUrl, token, page]);

    if (loading && page === 1) return <LoadingSpinner />;

    return (
        <div className="seller-bills-container">
            {bills.length === 0 ? (
                <div className="no-bills">{t("noOrders")}</div>
            ) : (
                <>
                    <div className="bills-list">
                        {bills.map((bill) => {
                            const order = bill.order || {};
                            const product = bill.product || {};

                            return (
                                <div key={bill.id} className="bill-card-zara">
                                    <div className="bill-card-header">
                                        <div className="header-left">
                                            <div className="title-status-group">
                                                <h2 className="bill-main-title">{t("bill_main_title")}</h2>
                                                <div className={`bill-status-badge-zara ${bill.isPaid ? 'paid' : 'open'}`}>
                                                    {bill.isPaid ? t("bill_status_paid") : t("bill_status_open")}
                                                </div>
                                            </div>
                                            <span className="facture-number">
                                                {t("bill_number_label")}: {bill.billNumber}
                                            </span>
                                        </div>
                                        <div className="header-right">
                                            <span className="cost-label">{t("bill_costs")}</span>
                                            <span className="cost-value">{Number(bill.amount || 0).toFixed(3)} {t("price_suf")}</span>
                                        </div>
                                    </div>

                                    <div className="bill-card-body">
                                        <div className="body-row">
                                            <div className="info-block">
                                                <span className="label-zara">{t("product")}</span>
                                                <span className="value-zara">{product.name || t("unknown")}</span>
                                            </div>
                                            <div className="info-block">
                                                <span className="label-zara">{t("bill_order_number")}</span>
                                                <span className="value-zara">#{order.orderNumber}</span>
                                            </div>
                                        </div>
                                        <div className="body-row">
                                            <div className="info-block">
                                                <span className="label-zara">{t("bill_date")}</span>
                                                <span className="value-zara">{new Date(bill.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="info-block">
                                                <span className="label-zara">{t("bill_commission_rate")}</span>
                                                <span className="value-zara">3% ({Number(product.price || 0).toFixed(3)} x 3%)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(prev => prev - 1)}
                                className="pagination-btn"
                            >
                                {t("previous")}
                            </button>
                            <span className="page-info">
                                {page} / {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(prev => prev + 1)}
                                className="pagination-btn"
                            >
                                {t("next")}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default SellerBills; */
