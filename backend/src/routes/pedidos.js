const router = require("express").Router();
const Pedido = require("../models/Pedido");
const auth = require("../middleware/auth");

router.get("/", auth, async (_, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate("itens.produtoId")
      .populate("itens.sabor1Id")
      .populate("itens.sabor2Id")
      .sort({ criadoEm: -1 });

    res.json({
      data: pedidos.map(p => ({
        id: p._id,
        cliente: {
          nome: p.cliente.nome,
          telefone: p.cliente.telefone
        },
        total: p.total,
        status: p.status,
        metodoPagamento: p.metodoPagamento,
        tipoEntrega: p.tipoEntrega,
        endereco: p.endereco,
        criadoEm: p.criadoEm,
        itens: p.itens.map(i => ({
          quantidade: i.quantidade, 
          isMeioAMeio: i.isMeioAMeio,
          produto: i.produtoId,
          sabor1: i.sabor1Id,
          sabor2: i.sabor2Id,
          borda: i.borda,
          observacao: i.observacao
        }))
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar pedidos." });
  }
});

router.post("/", async (req, res) => {
  const pedido = await Pedido.create(req.body);
  res.json(pedido);
});

router.patch("/:id/status", auth, async (req, res) => {
  res.json(
    await Pedido.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
  );
});

module.exports = router;
