import React, { useState, useEffect } from "react";
import "./upload_status.css";
import { useTranslation } from "react-i18next";
import { FaTimes } from "react-icons/fa";

function UploadStatus({ status }) {
  const { t } = useTranslation();
  const [isInternalVisible, setIsInternalVisible] = useState(true);

  // Sync internal state with external status updates
  useEffect(() => {
    if (status.visible) {
      setIsInternalVisible(true);
    }
  }, [status.visible]);

  // Auto-hide the popup after 3 seconds if it's a Success or Error
  useEffect(() => {
    if (status.success || status.error) {
      const timer = setTimeout(() => {
        setIsInternalVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status.success, status.error]);

  // IMPORTANT: Don't render if either the Manager says 'not visible' 
  // or the user manually closed it.
  if (!status.visible || !isInternalVisible) return null;

  return (
    <div className="upload-overlay">
      <div className="upload-box">
        {/* Manual close button - hidden during active loading */}
        {!status.loading && (
          <button
            className="close-status-btn"
            onClick={() => setIsInternalVisible(false)}
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
          >
            <FaTimes />
          </button>
        )}

        {/* LOADING STATE */}
        {status.loading && (
          <>
            <div className="spinner"></div>
            <p>{t("upload_status.loading")}</p>
          </>
        )}

        {/* SUCCESS STATE */}
        {status.success && (
          <>
            <div className="success-icon">✅</div>
            <p>{t("upload_status.success")}</p>
          </>
        )}

        {/* ERROR STATE */}
        {status.error && (
          <>
            <div className="error-icon">❌</div>
            <p>{t(status.errorKey || "upload_status.error")}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default UploadStatus;