const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Dados iniciais do cardápio expandido
let menu = [
  { id: 1, nome: "Margherita", preco: 35, descricao: "Molho de tomate, mussarela de búfala e manjericão.", categoria: "Clássicas", tipo: "pizza" },
  { id: 2, nome: "Calabresa", preco: 38, descricao: "Calabresa defumada, cebola roxa e azeitonas.", categoria: "Clássicas", tipo: "pizza" },
  { id: 3, nome: "Portuguesa", preco: 42, descricao: "Presunto, ovos, ervilhas, cebola e mussarela.", categoria: "Tradicionais", tipo: "pizza" },
  { id: 4, nome: "Baianinha Especial", preco: 48, descricao: "Carne de sol, queijo coalho e pimenta biquinho.", categoria: "Especiais", tipo: "pizza" },
  { id: 5, nome: "Chocolate com Morango", preco: 45, descricao: "Chocolate ao leite, morangos frescos e granulado.", categoria: "Doces", tipo: "pizza" },
  { id: 6, nome: "Romeu e Julieta", preco: 40, descricao: "Mussarela e goiabada cremosa.", categoria: "Doces", tipo: "pizza" },
  { id: 7, nome: "Coca-Cola 2L", preco: 12, descricao: "Refrigerante 2 litros.", categoria: "Bebidas", tipo: "bebida" },
  { id: 8, nome: "Suco de Laranja 500ml", preco: 8, descricao: "Suco natural de laranja.", categoria: "Bebidas", tipo: "bebida" },
  { id: 9, nome: "Cerveja Artesanal", preco: 15, descricao: "Cerveja local 600ml.", categoria: "Bebidas", tipo: "bebida" }
];

let pedidos = [];

// Opções de bordas
const bordas = [
  { id: 'nenhuma', nome: 'Sem Borda Recheada', preco: 0 },
  { id: 'catupiry', nome: 'Borda de Catupiry', preco: 5 },
  { id: 'cheddar', nome: 'Borda de Cheddar', preco: 5 },
  { id: 'chocolate', nome: 'Borda de Chocolate', preco: 7 }
];

// Rotas do Cardápio
app.get('/api/menu', (req, res) => res.json(menu));
app.post('/api/menu', (req, res) => {
  const novaItem = { id: Date.now(), ...req.body };
  menu.push(novaItem);
  res.status(201).json(novaItem);
});
app.put('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const index = menu.findIndex(m => m.id == id);
  if (index !== -1) {
    menu[index] = { ...menu[index], ...req.body };
    res.json(menu[index]);
  } else res.status(404).send();
});
app.delete('/api/menu/:id', (req, res) => {
  menu = menu.filter(m => m.id != req.params.id);
  res.status(204).send();
});

// Rota de Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'baianinha123') {
    res.json({ token: 'fake-jwt-token-baianinha' });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});

// Rotas de Pedidos
app.get('/api/pedidos', (req, res) => res.json(pedidos));
app.post('/api/pedidos', (req, res) => {
  const novoPedido = {
    id: pedidos.length + 1,
    ...req.body,
    status: 'Pendente',
    data: new Date().toISOString()
  };
  pedidos.unshift(novoPedido);
  res.status(201).json(novoPedido);
});

app.patch('/api/pedidos/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = pedidos.findIndex(p => p.id == id);
  if (index !== -1) {
    pedidos[index].status = status;
    res.json(pedidos[index]);
  } else res.status(404).send();
});

// Estatísticas
app.get('/api/stats', (req, res) => {
  const totalFaturamento = pedidos
    .filter(p => p.status === 'Entregue')
    .reduce((acc, p) => acc + p.total, 0);
  
  const totalPedidos = pedidos.length;
  
  const vendasPorItem = {};
  pedidos.forEach(p => {
    p.itens.forEach(item => {
      const nome = item.isMeioAMeio 
        ? `Meio a Meio (${item.sabor1.nome} / ${item.sabor2.nome})`
        : item.produto.nome;
      vendasPorItem[nome] = (vendasPorItem[nome] || 0) + item.qtd;
    });
  });

  const topItens = Object.entries(vendasPorItem)
    .map(([nome, qtd]) => ({ nome, qtd }))
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 5);

  res.json({
    totalFaturamento,
    totalPedidos,
    topItens,
    pedidosRecentes: pedidos.slice(0, 10)
  });
});

app.listen(PORT, () => {
  console.log(`Servidor da Pizzaria Baianinha rodando na porta ${PORT}`);
});
