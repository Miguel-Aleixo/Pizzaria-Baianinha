const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Banco de dados em memória (simulado)
let menu = [
  { id: 1, nome: 'Margherita', preco: 35.00, descricao: 'Molho de tomate artesanal, mussarela de búfala e manjericão fresco.', categoria: 'Clássicas' },
  { id: 2, nome: 'Calabresa', preco: 38.00, descricao: 'Calabresa defumada premium, cebola roxa e azeitonas pretas.', categoria: 'Clássicas' },
  { id: 3, nome: 'Portuguesa', preco: 42.00, descricao: 'Presunto cozido, ovos, ervilhas, cebola e mussarela.', categoria: 'Tradicionais' },
  { id: 4, nome: 'Frango com Catupiry', preco: 40.00, descricao: 'Frango desfiado temperado com o legítimo Catupiry.', categoria: 'Tradicionais' },
  { id: 5, nome: 'Baianinha Especial', preco: 48.00, descricao: 'Carne de sol desfiada, queijo coalho, pimenta biquinho e coentro.', categoria: 'Especiais' },
];

let pedidos = [];

// --- Autenticação ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // Login simples para demonstração
  if (username === 'admin' && password === 'baianinha123') {
    res.json({ 
      token: 'fake-jwt-token-baianinha',
      user: { name: 'Administrador', role: 'admin' }
    });
  } else {
    res.status(401).json({ message: 'Usuário ou senha incorretos' });
  }
});

// --- Rotas do Cardápio ---
app.get('/api/menu', (req, res) => {
  res.json(menu);
});

app.post('/api/menu', (req, res) => {
  const novaPizza = { id: Date.now(), ...req.body };
  menu.push(novaPizza);
  res.status(201).json(novaPizza);
});

app.put('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const index = menu.findIndex(p => p.id == id);
  if (index !== -1) {
    menu[index] = { ...menu[index], ...req.body };
    res.json(menu[index]);
  } else {
    res.status(404).json({ message: 'Pizza não encontrada' });
  }
});

app.delete('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  menu = menu.filter(p => p.id != id);
  res.status(204).send();
});

// --- Rotas de Pedidos ---
app.get('/api/pedidos', (req, res) => {
  res.json(pedidos);
});

app.post('/api/pedidos', (req, res) => {
  const novoPedido = { 
    id: Math.floor(Math.random() * 10000), 
    data: new Date().toISOString(),
    status: 'Pendente',
    ...req.body 
  };
  pedidos.unshift(novoPedido); // Adiciona no início da lista
  res.status(201).json({ message: 'Pedido confirmado!', pedido: novoPedido });
});

app.patch('/api/pedidos/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = pedidos.findIndex(p => p.id == id);
  if (index !== -1) {
    pedidos[index].status = status;
    res.json(pedidos[index]);
  } else {
    res.status(404).json({ message: 'Pedido não encontrado' });
  }
});

app.get('/api/stats', (req, res) => {
  const totalFaturamento = pedidos
    .filter(p => p.status === 'Entregue')
    .reduce((acc, p) => acc + p.total, 0);
  
  const totalPedidos = pedidos.length;
  
  const vendasPorPizza = {};
  pedidos.forEach(p => {
    p.itens.forEach(item => {
      const nome = item.pizza.nome;
      vendasPorPizza[nome] = (vendasPorPizza[nome] || 0) + item.qtd;
    });
  });

  const topPizzas = Object.entries(vendasPorPizza)
    .map(([nome, qtd]) => ({ nome, qtd }))
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 5);

  res.json({
    totalFaturamento,
    totalPedidos,
    topPizzas,
    pedidosRecentes: pedidos.slice(0, 10)
  });
});

app.listen(PORT, () => {
  console.log(`Servidor da Pizzaria Baianinha rodando na porta ${PORT}`);
});
