require('dotenv').config({ path: '../.env' }); // falls du dein Skript aus dem Root startest
const mongoose = require('mongoose');
const connectDB = require('../db'); // nutzt dein existierendes Verbindungsmodul
const Product = require('../models/product');

// 🔢 Produktnummern-Generator
function generateProductNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `PR-${randomLetter}${randomNum}`;
}

async function addMissingProductNumbers() {
  await connectDB(); // Verbindung mit DB aufbauen

  try {
    const productsWithoutNumber = await Product.find({
      $or: [
        { productNumber: { $exists: false } },
        { productNumber: null },
        { productNumber: "" }
      ]
    });

 

    for (const product of productsWithoutNumber) {
      let newNumber;
      let exists = true;

      // Eindeutige Produktnummer generieren
      while (exists) {
        newNumber = generateProductNumber();
        const duplicate = await Product.findOne({ productNumber: newNumber });
        if (!duplicate) exists = false;
      }

      product.productNumber = newNumber;
      await product.save();
 
    }

    console.log("🎉 Alle fehlenden Produktnummern wurden erfolgreich erstellt!");
  } catch (error) {
    console.error("❌ Fehler beim Generieren der Produktnummern:", error);
  } finally {
    mongoose.connection.close(); // Verbindung sauber schließen
  }
}

// Skript starten
addMissingProductNumbers();
