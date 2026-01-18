const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema({
  nome: String,
  preco: Number,
  descricao: String,
  categoria: String,
  tipo: {
    type: String,
    enum: ["pizza", "bebida"],
    required: true
  }
});

module.exports = mongoose.model("Menu", MenuSchema);
