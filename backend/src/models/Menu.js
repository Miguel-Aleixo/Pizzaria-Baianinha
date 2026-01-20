const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema({
  nome: String,
  preco: Number,
  descricao: String,
  categoria: String,
  tipo: {
    type: String,
    enum: ["pizza", "bebida"],
    required: true,
  },
  imagem: String,
  imagemId: String,
});

module.exports = mongoose.model("Menu", MenuSchema);
