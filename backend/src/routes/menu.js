const router = require("express").Router();
const Menu = require("../models/Menu");
const auth = require("../middleware/auth");

// GET
router.get("/", async (_, res) => {
  const menu = await Menu.find();
  res.json({
    data: menu.map(i => ({
      id: i._id,
      nome: i.nome,
      preco: i.preco,
      descricao: i.descricao,
      categoria: i.categoria,
      tipo: i.tipo
    }))
  });
});

// CREATE
router.post("/", auth, async (req, res) => {
  const { nome, preco, categoria, descricao, tipo } = req.body;

  if (!nome || !preco || !categoria || !tipo) {
    return res.status(400).json({ message: "Campos obrigatórios faltando" });
  }

  const item = await Menu.create({
    nome,
    preco,
    categoria,
    descricao,
    tipo
  });

  res.json({ data: item });
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
  const item = await Menu.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json({ data: item });
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  await Menu.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
