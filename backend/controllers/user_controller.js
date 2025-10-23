// backend/controllers/user_controller.js
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Alle Benutzer abrufen
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Abrufen der Benutzer", error: err });
  }
};

// Einzelnen Benutzer nach ID abrufen
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Benutzer nicht gefunden" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Abrufen des Benutzers", error: err });
  }
};

// Neuen Benutzer erstellen (Registrierung)
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ firstName, lastName, email, password: hashedPassword, phone });
    await newUser.save();

    res.status(201).json({ message: "User erstellt" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Serverfehler" });
  }
};


// Adresse und Telefonnummer des Users aktualisieren
exports.updateContact = async (req, res) => {
  try {
    const userId = req.params.id; // aus der URL
    const { address, phone } = req.body; // Adresse & Telefonnummer kommen direkt aus Body

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Benutzer nicht gefunden" });
    }

    // Wenn address übergeben wurde → Felder aktualisieren
    if (address) {
      user.address = {
        street: address.street || user.address?.street,
        postalCode: address.postalCode || user.address?.postalCode,
        city: address.city || user.address?.city,
      };
    }

    // Wenn phone übergeben wurde → aktualisieren
    if (phone) {
      user.phone = phone;
    }

    await user.save();

    res.status(200).json({
      message: "Adresse und Telefonnummer aktualisiert",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Fehler beim Aktualisieren der Adresse oder Telefonnummer",
      error: err.message,
    });
  }
};
