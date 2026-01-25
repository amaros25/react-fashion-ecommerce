import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCheckCircle, FaTimesCircle, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from "../../context/AuthContext";
import './PaymentStatus.css';

const PaymentStatus = ({ type }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { token } = useAuth();
    const [verifying, setVerifying] = useState(type === 'success');
    const [error, setError] = useState(null);

    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('payment_id');

    useEffect(() => {
        if (type === 'success' && paymentId) {
            verifyPayment();
        }
    }, [paymentId, type]);

    const verifyPayment = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/orders/verify-payment/${paymentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data && response.data.success) {
                setVerifying(false);
            } else {
                setError('verification_failed');
                setVerifying(false);
            }
        } catch (err) {
            console.error("Verification Error:", err);
            setError('verification_error');
            setVerifying(false);
        }
    };

    if (verifying) {
        return (
            <div className="payment-status-container">
                <div className="status-card">
                    <div className="loader"></div>
                    <h2>{t('payment.verifying') || 'Verifying your payment...'}</h2>
                </div>
            </div>
        );
    }

    const isSuccess = type === 'success' && !error;

    return (
        <div className="payment-status-container">
            <div className={`status-card ${isSuccess ? 'success' : 'fail'}`}>
                {isSuccess ? (
                    <>
                        <FaCheckCircle className="status-icon success" />
                        <h2>{t('payment.success_title') || 'Payment Successful!'}</h2>
                        <p>{t('payment.success_desc') || `Your order #${orderId} has been placed successfully.`}</p>
                    </>
                ) : (
                    <>
                        <FaTimesCircle className="status-icon fail" />
                        <h2>{t('payment.fail_title') || 'Payment Failed'}</h2>
                        <p>{t('payment.fail_desc') || 'Something went wrong with your transaction. Please try again or contact support.'}</p>
                        {error && <p className="error-detail">{t(`payment.error_${error}`) || error}</p>}
                    </>
                )}

                <div className="actions">
                    <button onClick={() => navigate('/profile_user')} className="primary-btn">
                        {t('payment.view_orders') || 'View My Orders'} <FaArrowRight />
                    </button>
                    <button onClick={() => navigate('/home')} className="secondary-btn">
                        {t('payment.back_home') || 'Back to Home'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus;
