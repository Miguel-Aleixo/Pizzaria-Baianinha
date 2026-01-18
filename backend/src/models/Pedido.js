const mongoose = require("mongoose");

const PedidoSchema = new mongoose.Schema({
  cliente: {
    nome: { type: String, required: true },
    telefone: { type: String, required: true },
  },
  itens: [
    {
      produtoId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
      sabor1Id: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
      sabor2Id: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
      isMeioAMeio: Boolean,
      borda: {
        nome: String,
        preco: Number,
      },
      observacao: String,
      quantidade: Number,
      precoUnitario: Number,
    }
  ],
  total: Number,
  status: String,
  metodoPagamento: String,
  tipoEntrega: String,
  endereco: Object,
  criadoEm: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Pedido", PedidoSchema);
