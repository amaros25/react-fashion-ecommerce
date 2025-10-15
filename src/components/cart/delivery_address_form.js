import React, { useState } from "react";

function DeliveryAddressForm({ address, onSaveAddress }) {
  // Local state inside form
  const [localAddress, setLocalAddress] = useState(address);
  console.log("🟢 DeliveryAddressForm", address);
  return (
    <div className="address-section">
      <h3>📦 Lieferadresse</h3>

      <div className="address-form">
        {/* Full width street */}
        <input
          type="text"
          placeholder="Straße"
          value={localAddress.street}
          onChange={(e) =>
            setLocalAddress({ ...localAddress, street: e.target.value })
          }
        />

        {/* City + Postal code in one row */}
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

        {/* Save button centered */}
        <div className="address-button-row">
          <button
            className="save-address-button"
            onClick={() => onSaveAddress(localAddress)}
          >
            💾 Adresse speichern
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeliveryAddressForm;
