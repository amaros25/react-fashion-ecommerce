const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },   // Vorname
  lastName: { type: String, required: true },    // Nachname
  email: { type: String, required: true, unique: true }, // Email, eindeutig
  password: { type: String, required: true },   // Passwort (gehasht speichern)
  phone: { type: String }                        // Telefonnummer (optional oder Pflicht je nach Bedarf)
}, { timestamps: true }); // automatisch createdAt, updatedAt

module.exports = mongoose.model("User", userSchema);