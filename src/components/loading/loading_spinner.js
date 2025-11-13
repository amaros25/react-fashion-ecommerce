// LoadingSpinner.js
import React from "react";
import "./loading_spinner.css";

function LoadingSpinner() {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
    </div>
  );
}

export default LoadingSpinner;
