import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function DeliveryAddressForm({ address, phone, onSaveAddress }) {
  const { t } = useTranslation(); // <== Hook initialisieren
  const [localAddress, setLocalAddress] = useState(address);
  const [localPhone, setLocalPhone] = useState(phone || "");

  const handleSave = () => {
    onSaveAddress({
      address: localAddress,
      phone: localPhone,
    });
  };

  return (
    <div className="address-section">
      <h3>{t("edit_delivery_address")}</h3>

      <div className="address-form">
        <input
          type="text"
          placeholder={t("street")}
          value={localAddress.street}
          onChange={(e) =>
            setLocalAddress({ ...localAddress, street: e.target.value })
          }
        />

        <div className="address-form-row">
          <input
            type="text"
            placeholder={t("city")}
            value={localAddress.city}
            onChange={(e) =>
              setLocalAddress({ ...localAddress, city: e.target.value })
            }
          />
          <input
            type="text"
            placeholder={t("postal_code")}
            value={localAddress.postalCode}
            onChange={(e) =>
              setLocalAddress({ ...localAddress, postalCode: e.target.value })
            }
          />
        </div>

        <input
          type="text"
          placeholder={t("phone_number")}
          value={localPhone}
          onChange={(e) => setLocalPhone(e.target.value)}
        />

        <div className="address-button-row">
          <button className="save-address-button" onClick={handleSave}>
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeliveryAddressForm;
