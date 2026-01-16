"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Minus, Trash2, ChevronRight, Star, Clock, MapPin, Lock, Pizza, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

interface IProduto {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  categoria: string;
  tipo: 'pizza' | 'bebida';
  imagem?: string;
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [filtro, setFiltro] = useState("Todas");
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Estados para o Modal de Personalização
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<IProduto | null>(null);
  const [isMeioAMeio, setIsMeioAMeio] = useState(false);
  const [sabor2, setSabor2] = useState<IProduto | null>(null);
  const [bordaSelecionada, setBordaSelecionada] = useState<IBorda>(BORDAS[0]);
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/menu`);
        const data = await res.json();
        setMenu(data);
      } catch (err) {
        console.error("Erro ao buscar menu:", err);
      }
    };
    fetchMenu();
  }, []);

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
    setIsCartOpen(true);
  };

  const removerDoCarrinho = (id_temp: string) => {
    setCarrinho(carrinho.filter(item => item.id_temp !== id_temp));
  };

  const totalItens = carrinho.reduce((acc, item) => acc + item.qtd, 0);
  const totalPreco = carrinho.reduce((acc, item) => acc + (item.precoUnitario * item.qtd), 0);

  const finalizarPedido = async () => {
    if (carrinho.length === 0) return;
    setIsFinalizing(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itens: carrinho, total: totalPreco }),
      });
      const data = await res.json();
      alert(data.message || "Pedido enviado com sucesso!");
      setCarrinho([]);
      setIsCartOpen(false);
    } catch (err) {
      console.error("Erro ao enviar pedido:", err);
      alert("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setIsFinalizing(false);
    }
  };

  const categorias = ["Todas", ...Array.from(new Set(menu.map((p) => p.categoria)))];
  const menuFiltrado = filtro === "Todas" ? menu : menu.filter((p) => p.categoria === filtro);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Navbar cartCount={totalItens} />

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-orange-600">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <div className="relative z-10 text-center px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-lg font-bold tracking-widest uppercase mb-4"
          >
            A Melhor Pizza da Região
          </motion.h2>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-tight"
          >
            Sabor que <br /> <span className="text-orange-200">Encanta.</span>
          </motion.h1>
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all flex items-center gap-2 mx-auto"
          >
            Ver Cardápio <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </section>

      {/* Info Bar */}
      <div className="max-w-7xl mx-auto px-6 -mt-5 relative z-20">
        <div className="bg-white shadow-xl rounded-2xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border border-orange-50">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-600"><Clock /></div>
            <div>
              <h4 className="font-bold">30-45 min</h4>
              <p className="text-sm text-gray-500">Tempo de entrega</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-600"><Star /></div>
            <div>
              <h4 className="font-bold">4.9 Estrelas</h4>
              <p className="text-sm text-gray-500">Avaliação dos clientes</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-600"><MapPin /></div>
            <div>
              <h4 className="font-bold">Entrega Grátis</h4>
              <p className="text-sm text-gray-500">Para pedidos acima de R$ 80</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <section id="menu" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-2">Nosso Cardápio</h2>
            <p className="text-gray-500">Escolha entre nossas opções artesanais</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltro(cat)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                  filtro === cat ? "bg-orange-600 text-white shadow-lg shadow-orange-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {menuFiltrado.map((produto) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={produto.id}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500"
              >
                <div className="h-64 bg-gray-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?auto=format&fit=crop&q=80')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-orange-600 uppercase">
                    {produto.categoria}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold group-hover:text-orange-600 transition-colors">{produto.nome}</h3>
                    <span className="text-xl font-black text-orange-600">R$ {produto.preco}</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8">{produto.descricao}</p>
                  <button
                    onClick={() => abrirPersonalizacao(produto)}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> {produto.tipo === 'pizza' ? 'Personalizar' : 'Adicionar ao Pedido'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Modal de Personalização */}
      <AnimatePresence>
        {isModalOpen && produtoSelecionado && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Personalizar</h2>
                    <p className="text-gray-500">{produtoSelecionado.nome}</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                    <X size={24} />
                  </button>
                </div>

                {produtoSelecionado.tipo === 'pizza' && (
                  <div className="space-y-8">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <label className="flex items-center gap-4 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isMeioAMeio} 
                          onChange={(e) => setIsMeioAMeio(e.target.checked)}
                          className="w-5 h-5 rounded accent-orange-600"
                        />
                        <span className="font-bold text-lg">Deseja meio a meio?</span>
                      </label>
                      
                      {isMeioAMeio && (
                        <div className="mt-6">
                          <p className="font-bold mb-3 text-gray-600 text-sm uppercase tracking-wider">Escolha o segundo sabor:</p>
                          <select 
                            className="w-full p-4 rounded-xl border border-gray-200 font-bold text-gray-700 outline-none focus:border-orange-600 transition-all"
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

                    <div>
                      <h4 className="font-bold text-lg mb-4">Escolha a Borda</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {BORDAS.map(b => (
                          <button 
                            key={b.id}
                            onClick={() => setBordaSelecionada(b)}
                            className={cn(
                              "p-4 rounded-xl border-2 text-left transition-all",
                              bordaSelecionada.id === b.id ? "border-orange-600 bg-orange-50" : "border-gray-100 hover:border-gray-200"
                            )}
                          >
                            <p className="font-bold">{b.nome}</p>
                            <p className="text-gray-500 text-sm">+ R${b.preco}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <h4 className="font-bold text-lg mb-4">Observações</h4>
                  <textarea 
                    placeholder="Ex: Sem cebola, bem passada..."
                    className="w-full p-4 rounded-2xl border border-gray-200 focus:border-orange-600 outline-none transition h-32 font-medium"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                  />
                </div>

                <button 
                  onClick={adicionarAoCarrinho}
                  className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-lg mt-10 hover:bg-orange-700 transition-all shadow-xl shadow-orange-200"
                >
                  Adicionar ao Pedido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {totalItens > 0 && (
          <motion.button
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-8 right-8 z-40 bg-orange-600 text-white px-8 py-4 rounded-full shadow-2xl shadow-orange-300 flex items-center gap-4 hover:scale-105 transition-transform"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                {totalItens}
              </span>
            </div>
            <span className="font-bold text-lg">Ver Pedido • R$ {totalPreco}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[60] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight">Seu Pedido</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                {carrinho.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="bg-gray-50 p-6 rounded-full mb-4"><ShoppingCart className="w-12 h-12 text-gray-300" /></div>
                    <p className="text-gray-500 font-medium">Seu carrinho está vazio.<br/>Que tal adicionar uma pizza?</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {carrinho.map((item) => (
                      <div key={item.id_temp} className="flex gap-4 bg-gray-50 p-4 rounded-2xl relative group">
                        <button 
                          onClick={() => removerDoCarrinho(item.id_temp)}
                          className="absolute -top-2 -right-2 bg-white text-red-500 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <h4 className="font-bold">
                              {item.isMeioAMeio ? `Meio ${item.sabor1?.nome} / Meio ${item.sabor2?.nome}` : item.produto?.nome}
                            </h4>
                            <span className="font-bold text-orange-600">R$ {item.precoUnitario}</span>
                          </div>
                          <div className="text-xs text-gray-400 space-y-1">
                            {item.borda.id !== 'nenhuma' && <p>• {item.borda.nome}</p>}
                            {item.observacao && <p className="italic">"{item.observacao}"</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-8 bg-gray-50 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">R$ {totalPreco}</span>
                </div>
                <div className="flex justify-between mb-6">
                  <span className="text-gray-500">Taxa de entrega</span>
                  <span className="text-green-600 font-bold">Grátis</span>
                </div>
                <div className="flex justify-between text-2xl font-black mb-8">
                  <span>Total</span>
                  <span>R$ {totalPreco}</span>
                </div>
                <button 
                  onClick={finalizarPedido}
                  disabled={carrinho.length === 0 || isFinalizing}
                  className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-orange-200"
                >
                  {isFinalizing ? "Processando..." : "Finalizar Pedido"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Pizza className="text-orange-500 w-8 h-8" />
              <span className="text-3xl font-black tracking-tighter">BAIANINHA</span>
            </div>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              Levando o melhor sabor da Bahia para sua mesa desde 2010. Ingredientes selecionados e massa de fermentação lenta.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Links Rápidos</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-orange-500 transition">Cardápio</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Sobre Nós</a></li>
              <li><a href="/admin" className="hover:text-orange-500 transition">Painel Admin</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Contato</h4>
            <ul className="space-y-4 text-gray-400">
              <li>(71) 9999-9999</li>
              <li>contato@baianinha.com</li>
              <li>Salvador, Bahia</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 mt-24 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <p>© 2026 Pizzaria Baianinha. Todos os direitos reservados.</p>
          <a 
            href="/admin" 
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <Lock size={14} /> Acesso Administrativo
          </a>
        </div>
      </footer>
    </div>
  );
}
