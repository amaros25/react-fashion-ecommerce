import React, { useState } from "react";

function DeliveryAddressForm({ address, phone, onSaveAddress }) {
  console.log("Address: ", address)
  console.log("Phone: ", phone)
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
      <h3>📦 Lieferadresse bearbeiten</h3>

      <div className="address-form">
        <input
          type="text"
          placeholder="Straße"
          value={localAddress.street}
          onChange={(e) =>
            setLocalAddress({ ...localAddress, street: e.target.value })
          }
        />
        <div className="address-form-row">
          <input
            type="text"
            placeholder="Stadt"
            value={localAddress.city}
            onChange={(e) =>
              setLocalAddress({ ...localAddress, city: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="PLZ"
            value={localAddress.postalCode}
            onChange={(e) =>
              setLocalAddress({ ...localAddress, postalCode: e.target.value })
            }
          />
        </div>

        {/* Telefonnummer */}
        <input
          type="text"
          placeholder="Telefonnummer"
          value={localPhone}
          onChange={(e) => setLocalPhone(e.target.value)}
        />

        <div className="address-button-row">
          <button className="save-address-button" onClick={handleSave}>
            💾 Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeliveryAddressForm;
