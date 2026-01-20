const router = require("express").Router();
const Menu = require("../models/Menu");
const auth = require("../middleware/auth");
const upload = require("../config/upload");
const cloudinary = require("../config/cloudinary");

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
      tipo: i.tipo,
      imagem: i.imagem,
    })),
  });
});

// CREATE
router.post(
  "/",
  upload.single("imagem"), // 👈 PRIMEIRO
  auth,
  async (req, res) => {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const nome = req.body?.nome;
    const preco = req.body?.preco;
    const categoria = req.body?.categoria;
    const descricao = req.body?.descricao;
    const tipo = req.body?.tipo;

    if (!nome || !preco || !categoria || !tipo) {
      return res.status(400).json({ message: "Campos obrigatórios faltando" });
    }

    const item = await Menu.create({
      nome,
      preco,
      categoria,
      descricao,
      tipo,
      imagem: req.file?.path || null,
      imagemId: req.file?.filename || null,
    });

    res.json({ data: item });
  }
);

// UPDATE
router.put(
  "/:id",
  auth,
  upload.single("imagem"),
  async (req, res) => {
    const item = await Menu.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item não encontrado" });
    }

    // 🔥 REMOVE IMAGEM
    if (req.body.removeImagem === "true" && item.imagemId) {
      await cloudinary.uploader.destroy(item.imagemId);
      item.imagem = null;
      item.imagemId = null;
    }

    // 🔁 NOVA IMAGEM
    if (req.file) {
      if (item.imagemId) {
        await cloudinary.uploader.destroy(item.imagemId);
      }

      item.imagem = req.file.path;
      item.imagemId = req.file.filename;
    }

    // ✍️ OUTROS CAMPOS
    item.nome = req.body.nome;
    item.preco = req.body.preco;
    item.descricao = req.body.descricao;
    item.categoria = req.body.categoria;
    item.tipo = req.body.tipo;

    await item.save();

    res.json({ data: item });
  }
);


// DELETE
router.delete("/:id", auth, async (req, res) => {
  const item = await Menu.findById(req.params.id);
  if (item?.imagemId) {
    await cloudinary.uploader.destroy(item.imagemId);
  }

  await Menu.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
