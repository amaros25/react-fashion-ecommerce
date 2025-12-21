// UploadStatus.js
import React from "react";
import "./upload_status.css";
import { useTranslation } from "react-i18next";

function UploadStatus({ status }) {
  const { t } = useTranslation();

  if (!status.visible) return null;

  return (
    <div className="upload-overlay">
      <div className="upload-box">
        {status.loading && (
          <>
            <div className="spinner"></div>
            <p>{t("upload_status.loading")}</p>
          </>
        )}

        {status.success && (
          <>
            <div className="success-icon">✅</div>
            <p>{t("upload_status.success")}</p>
          </>
        )}

        {status.error && (
          <>
            <div className="error-icon">❌</div>
            <p>{t("upload_status.error")}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default UploadStatus;
