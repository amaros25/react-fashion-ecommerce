import React, { useState, useEffect, useRef } from "react";
import "./main_profile_header.css";
import { cities, citiesData } from '../utils/const/cities';
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
    FaTrash, FaStar, FaStarHalfAlt, FaExclamationTriangle,
    FaMapMarkerAlt, FaPhone
} from 'react-icons/fa';
import useUploadImageApi from "../upload_image_profile/hooks/upload_image_api";
import {
    MdVerified, MdHourglassEmpty, MdBlock,
    MdErrorOutline, MdPersonOff
} from 'react-icons/md';

function MainProfileHeader({
    data, // user oder seller Objekt
    updateAddress,
    updatePhone,
    updateShopName,
    updateImage,
    isUpdatingAddress,
    isUpdatingPhone,
    isUpdatingShopName,
    isUpdatingImage,
    viewMode = "user"
}) {
    const cloudName = process.env.REACT_APP_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;
    const { uploadImage } = useUploadImageApi(cloudName, uploadPreset);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isAnyUpdating = isUpdatingAddress || isUpdatingPhone || isUpdatingImage || isUpdatingShopName;

    const fileInputRef = useRef(null);
    const [showSettings, setShowSettings] = useState(false);
    const [formData, setFormData] = useState({
        address: "",
        city: "",
        subCity: "",
        phone: "",
        shopName: ""
    });
    const [subCities, setSubCities] = useState([]);

    useEffect(() => {
        if (data) {
            const cityName = cities[data?.city] || "";
            setFormData({
                address: data?.address || "",
                city: cityName,
                subCity: citiesData[cityName]?.[data?.subCity] || "",
                phone: data?.phone || "",
                shopName: data?.shopName || ""
            });
            if (cityName) {
                setSubCities(citiesData[cityName] || []);
            }
        }
    }, [data]);

    const handleCityChange = (e) => {
        const cityName = e.target.value;
        setFormData({ ...formData, city: cityName, subCity: "" });
        setSubCities(citiesData[cityName] || []);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        try {
            const cityIndex = cities.indexOf(formData.city);
            const subCityIndex = citiesData[formData.city]?.indexOf(formData.subCity);
            if (subCityIndex < 0 || !formData.address) return toast.error(t("check_inputs"));

            let addressChanged = formData.address !== data.address || cityIndex !== data.city || subCityIndex !== data.subCity;
            let phoneChanged = formData.phone !== data.phone;
            let shopNameChanged = (data.role === 'seller') && (formData.shopName !== data.shopName);

            if (!addressChanged && !phoneChanged && !shopNameChanged) return toast.error(t("no_changes"));

            if (addressChanged) await updateAddress({ address: formData.address, city: cityIndex, subCity: subCityIndex });
            if (phoneChanged) await updatePhone(formData.phone);
            if (shopNameChanged) await updateShopName(formData.shopName);

            toast.success(t("profile_updated"));
            setShowSettings(false);
        } catch (error) {
            console.error("Update in Header failed", error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const handleProfileImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const imageUrl = await uploadImage(file);
            if (!imageUrl) return toast.error(t("upload_image_failed"));
            await updateImage({ imageUrl });
            toast.success(t("profile_image_updated"));
        } catch (error) {
            console.error("Update in Header failed", error);
        }
    };

    const getStatusIcon = () => {
        const iconStyle = { display: 'inline-block', verticalAlign: 'middle', marginLeft: '5px', width: '24px', height: '24px' };
        switch (data?.active) {
            case 'pending': return <MdHourglassEmpty style={{ ...iconStyle, color: '#f59e0b' }} />;
            case 'verified': return <MdVerified style={{ ...iconStyle, color: '#0095f6' }} />;
            case 'banned': return <MdBlock style={{ ...iconStyle, color: '#ef4444' }} />;
            case 'deleted': return <MdPersonOff style={{ ...iconStyle, color: '#ef4444' }} />;
            default: return null;
        }
    };

    const renderRating = () => {
        if (viewMode !== "seller") return null;
        return (
            <div className="rating-minimal">
                {[1, 2, 3, 4, 5].map((star) => {
                    const diff = data.averageRating - (star - 1);
                    if (diff >= 1) return <FaStar key={star} className="star-icon-minimal" />;
                    if (diff >= 0.5) return <FaStarHalfAlt key={star} className="star-icon-minimal" />;
                    return <FaStar key={star} className="star-icon-minimal empty" style={{ opacity: 0.3 }} />;
                })}

                <span className="rating-count">({data.reviewCount})</span>
            </div>
        );
    };

    const userCity = cities[data?.city] || "";
    const userSubCity = citiesData[userCity]?.[data?.subCity] || "";

    return (
        <div className="profile-header-container">
            {/* Status Banner */}
            {data?.active && !['active', 'verified'].includes(data?.active) && (
                <div className={`user-status-banner banner-${data?.active}`}>
                    <FaExclamationTriangle /> <span>{t(`user_status.${data?.active}`)}</span>
                </div>
            )}

            <div className="profile-minimal-card">
                <div className="profile-top-row">
                    {/* Identity Section */}
                    <div className="profile-identity">
                        <div className="profile-avatar-minimal" onClick={() => fileInputRef.current.click()}>
                            <img src={data?.imageUrl || '/default-avatar.png'} alt="Profile" style={{ opacity: isUpdatingImage ? 0.5 : 1 }} />
                            {isUpdatingImage && <div className="avatar-loader">...</div>}
                            <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleProfileImageChange} />
                        </div>
                        <div className="profile-info-minimal">
                            <div className="profile-name-row">
                                <h1 className="profile-name-minimal">
                                    {viewMode === "seller" ? data?.shopName : `${data?.firstName} ${data?.lastName}`}
                                    <span className="status-icon-wrapper">{getStatusIcon()}</span>
                                </h1>
                                <div className="rating-wrapper">{renderRating()}</div>
                            </div>

                            <div className="profile-identity-details">
                                <p className="profile-email-minimal">{data?.email}</p>
                                {viewMode === "seller" && (
                                    <p className="profile-realname-minimal">{data?.firstName} {data?.lastName}</p>
                                )}
                            </div>

                            <div className="profile-contact-minimal">
                                {data?.phone && (
                                    <div className="contact-item">
                                        <FaPhone size={12} />
                                        <span>{data?.phone}</span>
                                    </div>
                                )}
                                {(data?.address || userCity) && (
                                    <div className="contact-item">
                                        <FaMapMarkerAlt size={12} />
                                        <span>{[data?.address, userSubCity, userCity].filter(Boolean).join(', ')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {viewMode === "seller" && (
                        <div className="stats-minimal">
                            <div className="stat-item-minimal">
                                <span className="stat-value">{data?.productCount}</span>
                                <span className="stat-label">{t("products")}</span>
                            </div>
                            <div className="stat-item-minimal">
                                <span className="stat-value">{data?.orderCount}</span>
                                <span className="stat-label">{t("total_orders")}</span>
                            </div>
                            <div className="stat-item-minimal">
                                <span className="stat-value">{data?.openOrders}</span>
                                <span className="stat-label">{t("open_orders")}</span>
                            </div>
                        </div>
                    )}

                    {/* Rechte Seite: Stats & Actions */}
                    <div className="profile-actions-stats-group">
                        <div className="actions-minimal">
                            <button className="action-btn-minimal" onClick={() => navigate('/chat')}>
                                {t("messages")}
                                {data?.unreadMessages > 0 && <span className="badge-count">{data?.unreadMessages}</span>}
                            </button>
                            <button className="action-btn-minimal" onClick={() => setShowSettings(true)}>
                                {t("settings")}
                            </button>
                            <button className="action-btn-minimal logout" onClick={handleLogout}>
                                {t("logout")}
                            </button>
                        </div>


                    </div>
                </div>
            </div>

            {/* Modal Settings */}
            {/* Modal Settings */}
            {showSettings && (
                <div className="profile-modal-overlay">
                    <div className="profile-modal-content">
                        <div className="profile-modal-header">
                            <h2>{t("edit_profile")}</h2>
                            <button className="profile-close-modal-btn" onClick={() => setShowSettings(false)}>&times;</button>
                        </div>
                        <div className="profile-modal-body">
                            {data?.role === 'seller' && (
                                <div className="profile-form-group">
                                    <label>{t("register.shopName") || "Shop Name"}</label>
                                    <input type="text" name="shopName" value={formData.shopName} onChange={handleInputChange} disabled={isAnyUpdating} />
                                </div>
                            )}
                            <div className="profile-form-group">
                                <label>{t("phone_number")}</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} disabled={isAnyUpdating} />
                            </div>
                            <div className="profile-form-group">
                                <label>{t("street_address")}</label>
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} disabled={isAnyUpdating} />
                            </div>
                            <div className="profile-form-row">
                                <div className="profile-form-group half">
                                    <label>{t("city")}</label>
                                    <select name="city" value={formData.city} onChange={handleCityChange} disabled={isAnyUpdating}>
                                        <option value="">{t("select_city")}</option>
                                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="profile-form-group half">
                                    <label>{t("subcity")}</label>
                                    <select name="subCity" value={formData.subCity} onChange={handleInputChange} disabled={isAnyUpdating}>
                                        <option value="">{t("select_subcity")}</option>
                                        {subCities.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="profile-modal-footer">
                            <button className="profile-delete-account-link" onClick={() => toast.info(t("disabled"))}>
                                <FaTrash /> {t("delete_account")}
                            </button>
                            <div className="profile-modal-actions-right">
                                <button className="profile-cancel-btn" onClick={() => setShowSettings(false)}>{t("cancel")}</button>
                                <button className="profile-save-btn" onClick={handleUpdate} disabled={isAnyUpdating}>{isAnyUpdating ? t("saving") : t("save_changes")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MainProfileHeader;