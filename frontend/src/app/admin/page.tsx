"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Utensils, ShoppingBag, Plus, Trash2, Edit, CheckCircle, Clock, XCircle, BarChart3, TrendingUp, DollarSign, Package, Menu, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface IProduto {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  categoria: string;
  tipo: 'pizza' | 'bebida';
}

interface Pedido {
  id: number;
  itens: any[];
  total: number;
  status: string;
  data: string;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"pedidos" | "cardapio" | "relatorios">("pedidos");
  const [menu, setMenu] = useState<IProduto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<IProduto> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    router.push("/admin/login");
  };

  const fetchData = async () => {
    try {
      const [menuRes, pedidosRes, statsRes] = await Promise.all([
        fetch("https://pizzaria-baianinha.onrender.com/api/menu"),
        fetch("https://pizzaria-baianinha.onrender.com/api/pedidos"),
        fetch("https://pizzaria-baianinha.onrender.com/api/stats")
      ]);
      setMenu(await menuRes.json());
      setPedidos(await pedidosRes.json());
      setStats(await statsRes.json());
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingItem?.id ? "PUT" : "POST";
    const url = editingItem?.id 
      ? `https://pizzaria-baianinha.onrender.com/api/menu/${editingItem.id}` 
      : "https://pizzaria-baianinha.onrender.com/api/menu";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingItem),
    });
    setIsModalOpen(false);
    fetchData();
  };

  const handleDeleteItem = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      await fetch(`https://pizzaria-baianinha.onrender.com/api/menu/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  const updatePedidoStatus = async (id: number, status: string) => {
    await fetch(`https://pizzaria-baianinha.onrender.com/api/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="text-orange-500" />
          <span className="text-xl font-black tracking-tighter">ADMIN</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-slate-800 rounded-lg transition">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white p-6 flex flex-col transition-transform duration-300 md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-2 mb-12">
          <LayoutDashboard className="text-orange-500" />
          <span className="text-xl font-black tracking-tighter uppercase">Baianinha Admin</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => { setActiveTab("pedidos"); setIsMobileMenuOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition",
              activeTab === "pedidos" ? "bg-orange-600 text-white" : "hover:bg-slate-800 text-slate-400"
            )}
          >
            <ShoppingBag size={20} /> Pedidos
          </button>
          <button 
            onClick={() => { setActiveTab("cardapio"); setIsMobileMenuOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition",
              activeTab === "cardapio" ? "bg-orange-600 text-white" : "hover:bg-slate-800 text-slate-400"
            )}
          >
            <Utensils size={20} /> Cardápio
          </button>
          <button 
            onClick={() => { setActiveTab("relatorios"); setIsMobileMenuOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition",
              activeTab === "relatorios" ? "bg-orange-600 text-white" : "hover:bg-slate-800 text-slate-400"
            )}
          >
            <BarChart3 size={20} /> Relatórios
          </button>
        </nav>

        <div className="mt-auto space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-400 hover:bg-red-500/10 transition"
          >
            Sair do Painel
          </button>
          <a href="/" className="block text-sm text-slate-500 hover:text-white transition">Voltar para o Site</a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-12 gap-4">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 capitalize">{activeTab}</h1>
          {activeTab === "cardapio" && (
            <button 
              onClick={() => { setEditingItem({ tipo: 'pizza' }); setIsModalOpen(true); }}
              className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-700 transition shadow-lg shadow-orange-200"
            >
              <Plus size={20} /> Novo Item
            </button>
          )}
        </header>

        {activeTab === "relatorios" ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="bg-green-100 w-12 h-12 rounded-2xl flex items-center justify-center text-green-600 mb-4">
                  <DollarSign size={24} />
                </div>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-1">Faturamento Total</p>
                <h3 className="text-3xl font-black text-slate-900">R$ {stats?.totalFaturamento || 0}</h3>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                  <Package size={24} />
                </div>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-1">Total de Pedidos</p>
                <h3 className="text-3xl font-black text-slate-900">{stats?.totalPedidos || 0}</h3>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="bg-orange-100 w-12 h-12 rounded-2xl flex items-center justify-center text-orange-600 mb-4">
                  <TrendingUp size={24} />
                </div>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-1">Ticket Médio</p>
                <h3 className="text-3xl font-black text-slate-900">
                  R$ {stats?.totalPedidos > 0 ? (stats.totalFaturamento / stats.totalPedidos).toFixed(2) : 0}
                </h3>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp className="text-orange-500" /> Mais Vendidos
              </h3>
              <div className="space-y-4">
                {stats?.topItens?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="font-bold text-slate-700">{item.nome}</span>
                    <span className="font-black text-orange-600">{item.qtd} vendas</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === "pedidos" ? (
          <div className="grid gap-6">
            {pedidos.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-slate-200">
                <p className="text-slate-400 font-medium">Nenhum pedido recebido ainda.</p>
              </div>
            ) : (
              pedidos.map((pedido) => (
                <motion.div 
                  layout key={pedido.id} 
                  className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-6 md:gap-8"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Pedido #{pedido.id}</span>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase",
                        pedido.status === "Pendente" ? "bg-yellow-100 text-yellow-700" : 
                        pedido.status === "Preparando" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      )}>
                        {pedido.status}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {pedido.itens.map((item, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-2xl">
                          <p className="text-slate-900 font-black">
                            {item.qtd}x {item.isMeioAMeio ? `Meio ${item.sabor1.nome} / Meio ${item.sabor2.nome}` : item.produto.nome}
                          </p>
                          <div className="text-sm text-slate-500 mt-1 space-y-1">
                            {item.borda.id !== 'nenhuma' && <p>• {item.borda.nome}</p>}
                            {item.observacao && <p className="italic text-orange-600 font-medium">Obs: {item.observacao}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-4">
                    <span className="text-3xl font-black text-slate-900">R$ {pedido.total}</span>
                    <div className="flex gap-2">
                      {pedido.status === "Pendente" && (
                        <button onClick={() => updatePedidoStatus(pedido.id, "Preparando")} className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition"><Clock size={24} /></button>
                      )}
                      {pedido.status === "Preparando" && (
                        <button onClick={() => updatePedidoStatus(pedido.id, "Entregue")} className="p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition"><CheckCircle size={24} /></button>
                      )}
                      <button onClick={() => updatePedidoStatus(pedido.id, "Cancelado")} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition"><XCircle size={24} /></button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-8 py-4 font-bold text-slate-400 uppercase text-xs tracking-widest">Item</th>
                    <th className="px-8 py-4 font-bold text-slate-400 uppercase text-xs tracking-widest">Preço</th>
                    <th className="px-8 py-4 font-bold text-slate-400 uppercase text-xs tracking-widest">Categoria</th>
                    <th className="px-8 py-4 font-bold text-slate-400 uppercase text-xs tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {menu.map((item) => (
                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-900">{item.nome}</p>
                        <p className="text-sm text-slate-400">{item.descricao}</p>
                      </td>
                      <td className="px-8 py-6 font-bold text-slate-600">R$ {item.preco}</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">{item.categoria}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-orange-600 transition"><Edit size={18} /></button>
                          <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-slate-400 hover:text-red-600 transition"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Edição de Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
            <h2 className="text-3xl font-black mb-8 tracking-tighter">
              {editingItem?.id ? "Editar Item" : "Novo Item"}
            </h2>
            <form onSubmit={handleSaveItem} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Nome</label>
                <input 
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-orange-600 outline-none font-bold"
                  value={editingItem?.nome || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, nome: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Preço (R$)</label>
                  <input 
                    type="number"
                    className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-orange-600 outline-none font-bold"
                    value={editingItem?.preco || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, preco: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Tipo</label>
                  <select 
                    className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-orange-600 outline-none font-bold"
                    value={editingItem?.tipo || "pizza"}
                    onChange={(e) => setEditingItem({ ...editingItem, tipo: e.target.value as any })}
                  >
                    <option value="pizza">Pizza</option>
                    <option value="bebida">Bebida</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Categoria</label>
                <input 
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-orange-600 outline-none font-bold"
                  value={editingItem?.categoria || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, categoria: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Descrição</label>
                <textarea 
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-orange-600 outline-none font-medium h-24"
                  value={editingItem?.descricao || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, descricao: e.target.value })}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition">Cancelar</button>
                <button type="submit" className="flex-1 bg-orange-600 text-white py-4 rounded-2xl font-black hover:bg-orange-700 transition shadow-lg shadow-orange-200">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
