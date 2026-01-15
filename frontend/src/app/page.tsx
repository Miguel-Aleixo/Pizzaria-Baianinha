"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Minus, Trash2, ChevronRight, Star, Clock, MapPin, Lock, X, Info, Pizza } from "lucide-react";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

interface IProduto {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  categoria: string;
  tipo: 'pizza' | 'bebida';
}

interface IBorda {
  id: string;
  nome: string;
  preco: number;
}

interface IItemCarrinho {
  id_temp: string;
  produto?: IProduto;
  isMeioAMeio: boolean;
  sabor1?: IProduto;
  sabor2?: IProduto;
  borda: IBorda;
  observacao: string;
  qtd: number;
  precoUnitario: number;
}

const BORDAS: IBorda[] = [
  { id: 'nenhuma', nome: 'Sem Borda Recheada', preco: 0 },
  { id: 'catupiry', nome: 'Borda de Catupiry', preco: 5 },
  { id: 'cheddar', nome: 'Borda de Cheddar', preco: 5 },
  { id: 'chocolate', nome: 'Borda de Chocolate', preco: 7 }
];

export default function Home() {
  const [menu, setMenu] = useState<IProduto[]>([]);
  const [carrinho, setCarrinho] = useState<IItemCarrinho[]>([]);
  const [isCarrinhoOpen, setIsCarrinhoOpen] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");

  // Estados para o Modal de Personalização
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<IProduto | null>(null);
  const [isMeioAMeio, setIsMeioAMeio] = useState(false);
  const [sabor2, setSabor2] = useState<IProduto | null>(null);
  const [bordaSelecionada, setBordaSelecionada] = useState<IBorda>(BORDAS[0]);
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pizzaria-baianinha.onrender.com'}/api/menu`)
      .then(res => res.json())
      .then(data => setMenu(data))
      .catch(err => console.error("Erro ao buscar menu:", err));
  }, []);

  const categorias = ["Todas", ...Array.from(new Set(menu.map(p => p.categoria)))];
  const produtosFiltrados = categoriaAtiva === "Todas" 
    ? menu 
    : menu.filter(p => p.categoria === categoriaAtiva);

  const abrirPersonalizacao = (produto: IProduto) => {
    setProdutoSelecionado(produto);
    setIsMeioAMeio(false);
    setSabor2(null);
    setBordaSelecionada(BORDAS[0]);
    setObservacao("");
    setIsModalOpen(true);
  };

  const adicionarAoCarrinho = () => {
    if (!produtoSelecionado) return;

    const precoBase = isMeioAMeio && sabor2 
      ? Math.max(produtoSelecionado.preco, sabor2.preco) 
      : produtoSelecionado.preco;
    
    const precoTotalItem = precoBase + bordaSelecionada.preco;

    const novoItem: IItemCarrinho = {
      id_temp: Math.random().toString(36).substr(2, 9),
      produto: isMeioAMeio ? undefined : produtoSelecionado,
      isMeioAMeio,
      sabor1: isMeioAMeio ? produtoSelecionado : undefined,
      sabor2: isMeioAMeio ? (sabor2 || undefined) : undefined,
      borda: bordaSelecionada,
      observacao,
      qtd: 1,
      precoUnitario: precoTotalItem
    };

    setCarrinho([...carrinho, novoItem]);
    setIsModalOpen(false);
    setIsCarrinhoOpen(true);
  };

  const removerDoCarrinho = (id_temp: string) => {
    setCarrinho(carrinho.filter(item => item.id_temp !== id_temp));
  };

  const totalPreco = carrinho.reduce((acc, item) => acc + (item.precoUnitario * item.qtd), 0);

  const finalizarPedido = async () => {
    if (carrinho.length === 0) return;
    setIsFinalizing(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pizzaria-baianinha.onrender.com'}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itens: carrinho, total: totalPreco }),
      });
      alert("Pedido enviado com sucesso!");
      setCarrinho([]);
      setIsCarrinhoOpen(false);
    } catch (err) {
      alert("Erro ao enviar pedido.");
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=2000" 
            alt="Pizza" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-7xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-tight"
          >
            Pizzaria <span className="text-orange-500 text-shadow-lg">Baianinha</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-slate-200 mb-10 font-medium"
          >
            O tempero da Bahia na melhor pizza da cidade.
          </motion.p>
          <a href="#cardapio" className="bg-orange-600 text-white px-10 py-5 rounded-full font-black text-lg hover:bg-orange-700 transition-all shadow-2xl shadow-orange-900/20 inline-block">
            VER CARDÁPIO
          </a>
        </div>
      </section>

      {/* Menu Section */}
      <section id="cardapio" className="py-24 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h2 className="text-5xl font-black tracking-tighter mb-4">Nosso Cardápio</h2>
            <p className="text-slate-500 text-lg">Escolha entre pizzas clássicas, doces e bebidas geladas.</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {categorias.map(cat => (
              <button 
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={cn(
                  "px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap",
                  categoriaAtiva === cat ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {produtosFiltrados.map((produto) => (
            <motion.div 
              layout
              key={produto.id}
              className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
            >
              <div className="mb-6 overflow-hidden rounded-3xl h-48 bg-slate-100">
                <img 
                  src={produto.tipo === 'pizza' 
                    ? "https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?auto=format&fit=crop&q=80&w=800"
                    : "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800"
                  } 
                  alt={produto.nome}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-black tracking-tight">{produto.nome}</h3>
                <span className="text-orange-600 font-black text-xl">R${produto.preco}</span>
              </div>
              <p className="text-slate-500 mb-8 line-clamp-2 font-medium">{produto.descricao}</p>
              <button 
                onClick={() => abrirPersonalizacao(produto)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:bg-orange-600 transition-colors"
              >
                <Plus size={20} /> {produto.tipo === 'pizza' ? 'Personalizar' : 'Adicionar'}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Modal de Personalização */}
      <AnimatePresence>
        {isModalOpen && produtoSelecionado && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter">Personalizar Pedido</h2>
                    <p className="text-slate-500">{produtoSelecionado.nome}</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                    <X size={24} />
                  </button>
                </div>

                {produtoSelecionado.tipo === 'pizza' && (
                  <div className="space-y-8">
                    {/* Meio a Meio */}
                    <div className="bg-slate-50 p-6 rounded-3xl">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isMeioAMeio} 
                          onChange={(e) => setIsMeioAMeio(e.target.checked)}
                          className="w-6 h-6 rounded-lg accent-orange-600"
                        />
                        <span className="font-black text-lg">Deseja meio a meio?</span>
                      </label>
                      
                      {isMeioAMeio && (
                        <div className="mt-6">
                          <p className="font-bold mb-3 text-slate-600">Escolha o segundo sabor:</p>
                          <select 
                            className="w-full p-4 rounded-2xl border-2 border-slate-200 font-bold"
                            onChange={(e) => setSabor2(menu.find(p => p.id === Number(e.target.value)) || null)}
                          >
                            <option value="">Selecione um sabor...</option>
                            {menu.filter(p => p.tipo === 'pizza' && p.id !== produtoSelecionado.id).map(p => (
                              <option key={p.id} value={p.id}>{p.nome} (+R${p.preco})</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Bordas */}
                    <div>
                      <h4 className="font-black text-xl mb-4">Escolha a Borda</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {BORDAS.map(b => (
                          <button 
                            key={b.id}
                            onClick={() => setBordaSelecionada(b)}
                            className={cn(
                              "p-4 rounded-2xl border-2 text-left transition-all",
                              bordaSelecionada.id === b.id ? "border-orange-600 bg-orange-50" : "border-slate-100 hover:border-slate-200"
                            )}
                          >
                            <p className="font-bold">{b.nome}</p>
                            <p className="text-sm text-slate-500">+ R${b.preco}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Observações */}
                <div className="mt-8">
                  <h4 className="font-black text-xl mb-4">Observações</h4>
                  <textarea 
                    placeholder="Ex: Sem cebola, bem passada, etc..."
                    className="w-full p-6 rounded-3xl border-2 border-slate-100 focus:border-orange-600 outline-none transition-all h-32 font-medium"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                  />
                </div>

                <button 
                  onClick={adicionarAoCarrinho}
                  className="w-full bg-orange-600 text-white py-6 rounded-3xl font-black text-xl mt-10 hover:bg-orange-700 transition-all shadow-xl shadow-orange-200"
                >
                  ADICIONAR AO CARRINHO
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Carrinho Sidebar */}
      <AnimatePresence>
        {isCarrinhoOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCarrinhoOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150]"
            />
            <motion.aside 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[160] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-3xl font-black tracking-tighter">Seu Carrinho</h2>
                <button onClick={() => setIsCarrinhoOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {carrinho.length === 0 ? (
                  <div className="text-center py-20">
                    <ShoppingCart size={64} className="mx-auto text-slate-200 mb-6" />
                    <p className="text-slate-400 font-bold">Seu carrinho está vazio.</p>
                  </div>
                ) : (
                  carrinho.map((item) => (
                    <div key={item.id_temp} className="bg-slate-50 p-6 rounded-3xl relative group">
                      <button 
                        onClick={() => removerDoCarrinho(item.id_temp)}
                        className="absolute -top-2 -right-2 bg-white text-red-500 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="flex justify-between mb-2">
                        <h4 className="font-black text-lg">
                          {item.isMeioAMeio ? `Meio ${item.sabor1?.nome} / Meio ${item.sabor2?.nome}` : item.produto?.nome}
                        </h4>
                        <span className="font-black text-orange-600">R${item.precoUnitario}</span>
                      </div>
                      <div className="text-sm text-slate-500 space-y-1 font-medium">
                        {item.borda.id !== 'nenhuma' && <p>• {item.borda.nome}</p>}
                        {item.observacao && <p className="italic text-slate-400">" {item.observacao} "</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Total</span>
                  <span className="text-4xl font-black">R$ {totalPreco}</span>
                </div>
                <button 
                  disabled={carrinho.length === 0 || isFinalizing}
                  onClick={finalizarPedido}
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFinalizing ? "PROCESSANDO..." : "FINALIZAR PEDIDO"}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-24 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-4xl font-black tracking-tighter mb-6">Pizzaria <span className="text-orange-500">Baianinha</span></h3>
            <p className="text-gray-400 text-lg max-w-md">Levando o melhor sabor da Bahia para a sua mesa desde 2026. Qualidade e tradição em cada fatia.</p>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-orange-500">Links</h4>
            <ul className="space-y-4 text-gray-400 font-medium">
              <li><a href="#" className="hover:text-white transition">Início</a></li>
              <li><a href="#cardapio" className="hover:text-white transition">Cardápio</a></li>
              <li><a href="/admin" className="hover:text-white transition">Painel Admin</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm text-orange-500">Contato</h4>
            <ul className="space-y-4 text-gray-400 font-medium">
              <li>(71) 9999-9999</li>
              <li>Salvador, Bahia</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 mt-24 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <p>© 2026 Pizzaria Baianinha. Todos os direitos reservados.</p>
          <a href="/admin" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors text-gray-400 hover:text-white">
            <Lock size={14} /> Acesso Administrativo
          </a>
        </div>
      </footer>

      {/* Floating Cart Button */}
      {carrinho.length > 0 && !isCarrinhoOpen && (
        <motion.button 
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          onClick={() => setIsCarrinhoOpen(true)}
          className="fixed bottom-8 right-8 bg-orange-600 text-white p-6 rounded-full shadow-2xl z-[100] hover:scale-110 transition-transform"
        >
          <div className="relative">
            <ShoppingCart size={32} />
            <span className="absolute -top-2 -right-2 bg-white text-orange-600 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs">
              {carrinho.length}
            </span>
          </div>
        </motion.button>
      )}
    </div>
  );
}
