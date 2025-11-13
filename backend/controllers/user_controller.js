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
