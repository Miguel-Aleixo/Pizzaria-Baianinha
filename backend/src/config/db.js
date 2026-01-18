const mongoose = require("mongoose");

module.exports = async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🍃 Mongo conectado");
  } catch (err) {
    console.error("Erro Mongo:", err);
    process.exit(1);
  }
};
