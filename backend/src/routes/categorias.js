const router = require("express").Router();
const Categoria = require("../models/Categoria");
const auth = require("../middleware/auth");

const format = cat => ({
  id: cat._id,
  nome: cat.nome,
});

/* GET */
router.get("/", auth, async (_, res) => {
  const categorias = await Categoria.find();
  res.json({ data: categorias.map(format) });
});

/* POST */
router.post("/", auth, async (req, res) => {
  const categoria = await Categoria.create(req.body);
  res.json({ data: format(categoria) });
});

/* PUT */
router.put("/:id", auth, async (req, res) => {
  const categoria = await Categoria.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json({ data: format(categoria) });
});

/* DELETE */
router.delete("/:id", auth, async (req, res) => {
  await Categoria.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
