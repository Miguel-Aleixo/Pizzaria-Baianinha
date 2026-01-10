"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Minus, Trash2, ChevronRight, Star, Clock, MapPin, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

interface IPizza {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  categoria: string;
  imagem?: string;
}

export default function Home() {
  const [menu, setMenu] = useState<IPizza[]>([]);
  const [carrinho, setCarrinho] = useState<{ pizza: IPizza; qtd: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [filtro, setFiltro] = useState("Todas");
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch("https://pizzaria-baianinha.onrender.com/api/menu");
        const data = await res.json();
        setMenu(data);
      } catch (err) {
        console.error("Erro ao buscar menu:", err);
      }
    };
    fetchMenu();
  }, []);

  const adicionarAoCarrinho = (pizza: IPizza) => {
    const itemExistente = carrinho.find((item) => item.pizza.id === pizza.id);
    if (itemExistente) {
      setCarrinho(carrinho.map((item) => 
        item.pizza.id === pizza.id ? { ...item, qtd: item.qtd + 1 } : item
      ));
    } else {
      setCarrinho([...carrinho, { pizza, qtd: 1 }]);
    }
  };

  const removerDoCarrinho = (id: number) => {
    const itemExistente = carrinho.find((item) => item.pizza.id === id);
    if (itemExistente && itemExistente.qtd > 1) {
      setCarrinho(carrinho.map((item) => 
        item.pizza.id === id ? { ...item, qtd: item.qtd - 1 } : item
      ));
    } else {
      setCarrinho(carrinho.filter((item) => item.pizza.id !== id));
    }
  };

  const totalItens = carrinho.reduce((acc, item) => acc + item.qtd, 0);
  const totalPreco = carrinho.reduce((acc, item) => acc + item.pizza.preco * item.qtd, 0);

  const finalizarPedido = async () => {
    if (carrinho.length === 0) return;
    setIsFinalizing(true);

    try {
      const res = await fetch("https://pizzaria-baianinha.onrender.com/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itens: carrinho, total: totalPreco }),
      });
      const data = await res.json();
      alert(data.message);
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
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
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
            {menuFiltrado.map((pizza) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={pizza.id}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500"
              >
                <div className="h-64 bg-gray-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?auto=format&fit=crop&q=80')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-orange-600 uppercase">
                    {pizza.categoria}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold group-hover:text-orange-600 transition-colors">{pizza.nome}</h3>
                    <span className="text-xl font-black text-orange-600">R$ {pizza.preco}</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8">{pizza.descricao}</p>
                  <button
                    onClick={() => adicionarAoCarrinho(pizza)}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Adicionar ao Pedido
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

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
                  <Plus className="w-6 h-6 rotate-45" />
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
                      <div key={item.pizza.id} className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <h4 className="font-bold">{item.pizza.nome}</h4>
                            <span className="font-bold text-orange-600">R$ {item.pizza.preco * item.qtd}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                              <button onClick={() => removerDoCarrinho(item.pizza.id)} className="p-1 hover:bg-white rounded shadow-sm transition"><Minus className="w-4 h-4" /></button>
                              <span className="font-bold text-sm w-4 text-center">{item.qtd}</span>
                              <button onClick={() => adicionarAoCarrinho(item.pizza)} className="p-1 hover:bg-white rounded shadow-sm transition"><Plus className="w-4 h-4" /></button>
                            </div>
                            <button onClick={() => setCarrinho(carrinho.filter(c => c.pizza.id !== item.pizza.id))} className="text-gray-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
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
              <li><a href="#" className="hover:text-orange-500 transition">Trabalhe Conosco</a></li>
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
