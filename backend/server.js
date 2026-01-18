require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { enviarMensagemTelegram } = require('./src/bot/bot');

const connectDB = require("./src/config/db");
const auth = require("./src/middleware/auth");

const User = require("./src/models/User");
const Pedido = require("./src/models/Pedido");

const menuRoutes = require("./src/routes/menu");
const categoriasRoutes = require("./src/routes/categorias");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

/* LOGIN */
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: "Usuário não encontrado" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Senha incorreta" });

  const token = jwt.sign(
    { id: user._id, username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );

  res.json({ token });
});

/* ROTAS */
app.use("/api/menu", menuRoutes);
app.use("/api/categorias", categoriasRoutes);

/* PEDIDOS */
app.get("/api/pedidos", auth, async (_, res) => {
  try {
    // Populando os campos para que o Admin consiga exibir os nomes dos produtos
    const pedidos = await Pedido.find()
      .populate("itens.produtoId")
      .populate("itens.sabor1Id")
      .populate("itens.sabor2Id")
      .sort({ criadoEm: -1 });

    const formatado = pedidos.map(p => ({
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
    }));

    res.json({ data: formatado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar pedidos." });
  }
});


app.post("/api/pedidos", async (req, res) => {
  try {
    const pedido = await Pedido.create({
      ...req.body,
      status: "Pendente",
      criadoEm: new Date()
    });
    res.json({ data: pedido });
  } catch (error) {
    res.status(400).json({ message: "Erro ao criar pedido", error: error.message });
  }
});

app.patch("/api/pedidos/:id/status", auth, async (req, res) => {
  const pedido = await Pedido.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });

  enviarMensagemTelegram(pedido);
  
  // GATILHO PARA O SEU BOT
  console.log(`[BOT] Pedido #${pedido._id} mudou para: ${pedido.status}. Notificando ${pedido.cliente?.telefone}`);

  res.json({ data: pedido });
});

/* STATS */
app.get("/api/stats", auth, async (_, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate("itens.produtoId")
      .populate("itens.sabor1Id")
      .populate("itens.sabor2Id");

    const entregues = pedidos.filter(p => p.status === "Entregue");
    const faturamento = entregues.reduce((acc, p) => acc + (Number(p.total) || 0), 0);

    const vendas = {};
    pedidos.forEach(p => {
      if (p.status !== "Cancelado") {
        p.itens.forEach(i => {
          const qtd = Number(i.quantidade || i.qtd || 0);

          if (i.isMeioAMeio) {
            // Se for meio a meio, contamos meia unidade para cada sabor
            const nome1 = i.sabor1Id?.nome || "Sabor 1";
            const nome2 = i.sabor2Id?.nome || "Sabor 2";

            vendas[nome1] = (vendas[nome1] || 0) + (qtd * 0.5);
            vendas[nome2] = (vendas[nome2] || 0) + (qtd * 0.5);
          } else {
            // Se for inteira, contamos a unidade cheia
            const nome = i.produtoId?.nome || "Item";
            vendas[nome] = (vendas[nome] || 0) + qtd;
          }
        });
      }
    });

    const topItens = Object.entries(vendas)
      .map(([nome, qtd]) => ({
        nome,
        qtd: Number.isInteger(qtd) ? qtd : qtd.toFixed(1) // Mostra 1.5 se for o caso
      }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5);

    res.json({
      data: {
        faturamento: faturamento.toFixed(2),
        totalPedidos: pedidos.length,
        topItens,
      },
    });
  } catch (error) {
    console.error("Erro nos stats:", error);
    res.status(500).json({ message: "Erro ao calcular estatísticas" });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () =>
  console.log(`🔥 Backend rodando na porta ${PORT}`)
);
