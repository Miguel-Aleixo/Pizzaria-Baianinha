"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Utensils, ShoppingBag, Plus, Trash2, Edit, CheckCircle, Clock, XCircle, BarChart3, TrendingUp, DollarSign, Package, LogOut, Home, AlertCircle, ChevronRight, X, Tags,
  QrCode,
  ImageIcon,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useRef } from "react";

interface Categoria {
  id: string;
  nome: string;
}

interface IProduto {
  id: string;
  nome: string;
  preco: number;
  descricao: string;
  categoria: string;
  tipo: 'pizza' | 'bebida';
  imagem?: string;
  imagemFile?: string;
  file?: File;
  removeImagem?: boolean;
}

interface PedidoItem {
  id?: string;

  qtd: number;

  produto?: {
    id: string;
    nome: string;
    preco: number;
  };

  isMeioAMeio?: boolean;

  sabor1?: {
    id: string;
    nome: string;
  };

  sabor2?: {
    id: string;
    nome: string;
  };

  borda?: {
    id: string;
    nome: string;
    preco?: number;
  };

  observacao?: string;
}

interface Pedido {
  id: string;
  itens: PedidoItem[];
  total: number;

  status:
  | "Pendente"
  | "Preparando"
  | "Saiu para entrega"
  | "Entregue"
  | "Cancelado";

  pagamento: {
    metodo: "pix" | "cartao" | "dinheiro";
    status: "pendente" | "pago";
    trocoPara?: number;
  };

  cliente: {
    nome: string;
    telefone: string;
    endereco: string;
  };

  criadoEm: string;
}


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    },
  },
} as const;


export default function AdminPanel() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<"pedidos" | "cardapio" | "categorias" | "relatorios">("pedidos");
  const [menu, setMenu] = useState<IProduto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<IProduto> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("Todos");
  const statusFiltros = ["Todos", "Pendente", "Preparando", "Saiu para entrega", "Entregue", "Cancelado"];
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null); // Adicione esta linha

  const pedidosFiltrados = filtroStatus === "Todos"
    ? pedidos
    : pedidos.filter(p => p.status === filtroStatus);

  const router = useRouter();

  const fetchData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [menuRes, pedidosRes, statsRes, categoriasRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/menu`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("admin-token")}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/pedidos`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("admin-token")}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("admin-token")}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/categorias`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin-token")}`
          }
        })
      ]);

      const menuData = await menuRes.json();
      const pedidosData = await pedidosRes.json();
      const statsData = await statsRes.json();
      const categoriasData = await categoriasRes.json();

      setMenu(menuData.data || []);
      setPedidos(pedidosData.data || []);
      setStats(statsData.data || null);
      setCategorias(categoriasData.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
      fetchData();

      // Atualização automática a cada 30 segundos para novos pedidos
      const interval = setInterval(() => {
        fetchData(true); // Passamos true para não mostrar o loading de tela cheia
      }, 30000);

      return () => clearInterval(interval);
    }
  }, []);

  // Recarregar dados sempre que mudar de aba
  useEffect(() => {
    if (isAuthenticated) {
      fetchData(true);
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    router.push("/admin/login");
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const isEdit = Boolean(editingItem.id);

    const formData = new FormData();
    formData.append("nome", editingItem.nome || "");
    formData.append("preco", String(editingItem.preco || 0));
    formData.append("descricao", editingItem.descricao || "");
    formData.append("categoria", editingItem.categoria || "");
    formData.append("tipo", editingItem.tipo || "pizza");

    if (editingItem.removeImagem) {
      formData.append("removeImagem", "true");
    }

    if (editingItem.file) {
      formData.append("imagem", editingItem.file);
    }

    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/menu/${editingItem.id}`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/menu`;

    await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
      },
      body: formData,
    });

    setIsModalOpen(false);
    setEditingItem(null);
    fetchData();
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/menu/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("admin-token")}` },
    });

    fetchData();
  };

  const handleAddCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCategoria.trim()) return;

    if (editingCategoria) {
      // Lógica para Atualizar
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/categorias/${editingCategoria.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("admin-token")}` },
        body: JSON.stringify({ nome: novaCategoria }),
      });
      setEditingCategoria(null);
    } else {
      // Lógica para Criar (já existente)
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("admin-token")}` },
        body: JSON.stringify({ nome: novaCategoria }),
      });
    }

    setNovaCategoria("");
    fetchData();
  };

  const handleEditCategoria = (cat: Categoria) => {
    setEditingCategoria(cat);
    setNovaCategoria(cat.nome);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCategoria = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/categorias/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("admin-token")}` },
    });

    fetchData();
  };

  const updatePedidoStatus = async (id: string, status: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/pedidos/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("admin-token")}` },
      body: JSON.stringify({ status }),
    });

    fetchData();
  };

  const handleDeletePedido = async (id: string) => {
    const confirmacao = confirm(
      "Tem certeza que deseja excluir este pedido? Essa ação não pode ser desfeita."
    );

    if (!confirmacao) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005"}/api/pedidos/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      }
    );

    fetchData();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; icon: any }> = {
      "Pendente": { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
      "Preparando": { bg: "bg-blue-100", text: "text-blue-700", icon: Clock },
      "Saiu para entrega": { bg: "bg-purple-100", text: "text-purple-700", icon: TrendingUp },
      "Entregue": { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
      "Cancelado": { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    };
    return colors[status] || colors["Pendente"];
  };

  if (!isAuthenticated) return null;

  const navItems = [
    { id: "pedidos", label: "Pedidos", icon: ShoppingBag },
    { id: "cardapio", label: "Cardápio", icon: Utensils },
    { id: "categorias", label: "Categorias", icon: Tags },
    { id: "relatorios", label: "Relatórios", icon: BarChart3 },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingItem(prev => ({
        ...prev,
        imagem: reader.result as string, // preview
        file,                            // arquivo real
        removeImagem: false,             // cancela remoção
      }));
    };

    reader.readAsDataURL(file);
  };


  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setEditingItem(prev => ({
      ...prev,
      imagem: "",
      imagemId: "",
      removeImagem: true, // 👈 avisa o backend
    }));
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden font-sans text-slate-900">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-white text-slate-900 p-6 flex-col shadow-xl border-r border-orange-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2.5 bg-orange-600 rounded-xl shadow-lg shadow-orange-200">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight block text-slate-900">PIZZARIA</span>
            <span className="text-xs text-orange-600 font-bold uppercase tracking-widest">Admin Panel</span>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition duration-300 relative group",
                activeTab === item.id
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
                  : "text-slate-500 hover:text-orange-600 hover:bg-orange-50"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="space-y-3 border-t border-slate-100 pt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition duration-300"
          >
            <LogOut size={20} />
            Sair do Painel
          </button>
          <a href="/" className="px-4 py-2 text-sm text-slate-400 hover:text-orange-600 transition duration-300 font-bold flex items-center gap-2">
            <Home size={16} /> Voltar para o Site
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 mb-24 md:mb-0 overflow-y-auto bg-slate-50">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-black tracking-tighter uppercase">{navItems.find(i => i.id === activeTab)?.label}</h1>
          {activeTab === "pedidos" && (
            <div className="w-full md:w-auto overflow-x-auto pb-2 scrollbar-hide"
              style={{
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch' // Melhora o scroll no iPhone
              }}>
              <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-orange-50 shadow-sm min-w-max">
                {statusFiltros.map(status => (
                  <button
                    key={status}
                    onClick={() => setFiltroStatus(status)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap",
                      filtroStatus === status
                        ? "bg-orange-600 text-white shadow-md scale-105"
                        : "text-slate-400 hover:text-orange-600 hover:bg-orange-50"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}


          {activeTab === "cardapio" && <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-orange-700 transition shadow-lg shadow-orange-200"><Plus size={20} /> Novo Item</button>}
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
            <AlertCircle size={20} />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {/* ===========================
              PEDIDOS
          ============================ */}
        {activeTab === "pedidos" && (
          <div className="space-y-6">
            {loading && pedidos.length === 0 && (
              <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin mb-4 mx-auto"></div>
                <p className="text-slate-400 font-bold">Carregando pedidos...</p>
              </div>
            )}
            {pedidos.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-3xl border border-orange-50 shadow-sm">
                <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">Nenhum pedido recebido ainda</p>
              </div>
            )}
            {pedidosFiltrados.map((pedido) => {
              const statusColor = getStatusColor(pedido.status);
              const StatusIcon = statusColor.icon;
              return (
                <div key={pedido.id} className="bg-white p-6 md:p-8 rounded-3xl border border-orange-50 shadow-sm hover:shadow-md transition duration-300">
                  <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-8">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                        <span className="text-sm font-black relative left-1  text-slate-400 uppercase tracking-widest">
                          Pedido #{pedido.id}
                        </span>
                        <span className={cn(
                          "w-fit px-4 py-1.5 rounded-full text-xs font-black uppercase flex items-center gap-2  border border-black/5",
                          statusColor.bg,
                          statusColor.text
                        )}>
                          <StatusIcon size={14} /> {pedido.status}
                        </span>
                      </div>

                      {pedido.cliente?.telefone && (
                        <a
                          href={`https://wa.me/55${pedido.cliente.telefone.replace(/\D/g, '')}`}
                          target="_blank"
                          className="flex items-center gap-2 mx-px bg-green-50 text-green-600 px-4.5 py-1.5 rounded-t-full text-xs font-black hover:bg-green-100 transition shadow-sm border border-green-100"
                        >
                          <QrCode size={14} /> {pedido.cliente.nome}: {pedido.cliente.telefone}
                        </a>
                      )}

                      <div className="space-y-3">
                        {pedido.itens.map((item, idx) => (
                          <div key={idx} className={`bg-slate-50 p-5 ${pedido.cliente.nome ? "rounded-x-2xl rounded-b-2xl" : "rounded-2xl"} border border-slate-100`}>
                            <p className="text-slate-900 font-black text-lg">
                              {item.qtd}x{" "}
                              {item.isMeioAMeio
                                ? `Meio ${item.sabor1?.nome || 'Sabor 1'} / Meio ${item.sabor2?.nome || 'Sabor 2'}`
                                : item.produto?.nome || "Item"}
                            </p>
                            <div className="text-sm text-slate-500 mt-2 space-y-1 font-medium">
                              {item.borda?.id !== 'nenhuma' && <p className="flex items-center gap-1.5"><ChevronRight size={12} className="text-orange-600" /> {item.borda?.nome}</p>}
                              {item.observacao && <p className="italic text-orange-600 bg-orange-50 p-2 rounded-lg mt-2">Obs: {item.observacao}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between gap-4">
                      <div className="text-right">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Total do Pedido</p>
                        <span className="text-4xl font-black text-slate-900 tracking-tighter">R$ {pedido.total}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        {pedido.status === "Pendente" && (
                          <button
                            onClick={() => updatePedidoStatus(pedido.id, "Preparando")}
                            className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition shadow-sm"
                          >
                            <Clock size={20} />
                          </button>
                        )}

                        {pedido.status === "Preparando" && (
                          <button
                            onClick={() => updatePedidoStatus(pedido.id, "Saiu para entrega")}
                            className="p-4 bg-purple-50 text-purple-600 rounded-2xl hover:bg-purple-100 transition shadow-sm"
                          >
                            <TrendingUp size={20} />
                          </button>
                        )}

                        {pedido.status === "Saiu para entrega" && (
                          <button
                            onClick={() => updatePedidoStatus(pedido.id, "Entregue")}
                            className="p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition shadow-sm"
                          >
                            <CheckCircle size={20} />
                          </button>
                        )}

                        {pedido.status !== "Entregue" && (
                          <button
                            onClick={() => updatePedidoStatus(pedido.id, "Cancelado")}
                            className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition shadow-sm"
                            title="Cancelar pedido"
                          >
                            <XCircle size={20} />
                          </button>
                        )}

                        {/* 🔥 EXCLUIR — SOMENTE SE CANCELADO OU PENDENTE */}
                        {["Cancelado", "Pendente"].includes(pedido.status) && (
                          <button
                            onClick={() => handleDeletePedido(pedido.id)}
                            className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-red-50 hover:text-red-600 transition shadow-sm"
                            title="Excluir pedido"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===========================
              CARDÁPIO
          ============================ */}
        {activeTab === "cardapio" && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

            {/* Grid de Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {menu.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="bg-white rounded-4xl border border-orange-50 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-500 flex flex-col"
                >
                  {/* Imagem do Card */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    {item.imagem ? (
                      <img src={item.imagem} alt={item.nome} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-orange-50">
                        {item.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-black text-slate-900 text-lg leading-tight group-hover:text-orange-600 transition">{item.nome}</h4>
                    </div>
                    <p className="text-slate-400 text-sm font-medium line-clamp-2 mb-4 flex-1">{item.descricao}</p>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <span className="text-xl font-black text-slate-900 tracking-tighter">R$ {item.preco.toFixed(2)}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                          className="p-2 text-slate-300 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===========================
              CATEGORIAS
          ============================ */}
        {activeTab === "categorias" && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-orange-50 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tighter">
                {editingCategoria ? "Editar Categoria" : "Nova Categoria"}
              </h3>
              <form onSubmit={handleAddCategoria} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  placeholder="Ex: Pizzas Especiais"
                  className="flex-1 p-4 border border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-bold focus:border-orange-600 outline-none transition"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-orange-700 transition shadow-lg shadow-orange-200 uppercase text-xs tracking-widest flex-1 sm:flex-none"
                  >
                    {editingCategoria ? "Salvar" : "Adicionar"}
                  </button>
                  {editingCategoria && (
                    <button
                      type="button"
                      onClick={() => { setEditingCategoria(null); setNovaCategoria(""); }}
                      className="bg-slate-100 text-slate-500 px-8 py-4 rounded-2xl font-black hover:bg-slate-200 transition uppercase text-xs tracking-widest"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categorias.map((cat) => (
                <motion.div
                  key={cat.id}
                  variants={itemVariants}
                  className="bg-white p-6 rounded-3xl border border-orange-50 shadow-sm flex justify-between items-center group hover:border-orange-200 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                      <Tags size={20} />
                    </div>
                    <span className="font-black text-slate-900 group-hover:text-orange-600 transition">{cat.nome}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditCategoria(cat)}
                      className="p-2 text-slate-300 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategoria(cat.id)}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===========================
              RELATÓRIOS
          ============================ */}
        {activeTab === "relatorios" && stats && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Faturamento", value: `R$ ${stats.faturamento}`, icon: DollarSign, color: "text-green-600", bgColor: "bg-green-50" },
                { label: "Pedidos", value: stats.totalPedidos, icon: Package, color: "text-blue-600", bgColor: "bg-blue-50" },
                { label: "Ticket Médio", value: `R$ ${stats.totalPedidos > 0 ? (stats.faturamento / stats.totalPedidos).toFixed(2) : 0}`, icon: TrendingUp, color: "text-orange-600", bgColor: "bg-orange-50" },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl border border-orange-50 shadow-sm">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm", stat.bgColor, stat.color)}>
                    <stat.icon size={28} />
                  </div>
                  <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">{stat.label}</p>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                </div>
              ))}
            </div>
            <div className="bg-white p-8 rounded-3xl border border-orange-50 shadow-sm">
              <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tighter">
                <div className="p-2 bg-orange-50 rounded-xl text-orange-600"><TrendingUp size={24} /></div>
                Mais Vendidos
              </h3>
              <div className="space-y-4">
                {stats.topItens?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-orange-200 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-orange-600 text-sm shadow-sm border border-orange-50">{idx + 1}</div>
                      <p className="font-black text-slate-900 group-hover:text-orange-600 transition">{item.nome}</p>
                    </div>
                    <span className="text-orange-600 font-black text-sm md:text-lg px-5 py-2 bg-white rounded-xl border border-orange-50 shadow-sm">{item.qtd}x</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-orange-50 px-4 py-4 flex justify-between items-center z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-300",
              activeTab === item.id ? "text-orange-600 scale-110" : "text-slate-400"
            )}
          >
            <item.icon size={22} />
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            {activeTab === item.id && (
              <motion.div layoutId="activeDot" className="w-4 h-1 bg-orange-600 rounded-full" />
            )}
          </button>
        ))}
        <button onClick={handleLogout} className="flex flex-col items-center gap-1.5 text-red-400">
          <LogOut size={22} />
          <span className="text-[9px] font-black uppercase tracking-widest">Sair</span>
        </button>
      </nav>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 z-60 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-8 rounded-[2.5rem] w-full max-w-lg relative border border-orange-50 shadow-2xl">
              <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 p-2 bg-slate-50 rounded-full transition"><X size={20} /></button>
              <h2 className="text-3xl font-black mb-8 text-slate-900 tracking-tighter">{editingItem?.id ? "Editar Item" : "Novo Item"}</h2>
              <form onSubmit={handleSaveItem} className="space-y-6">

                <div>
                  <label className="block mb-2 font-black text-slate-400 text-xs uppercase tracking-widest">Nome do Produto</label>
                  <input type="text" value={editingItem?.nome || ""} onChange={e => setEditingItem(prev => ({ ...prev, nome: e.target.value }))} className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-bold focus:border-orange-600 outline-none transition" placeholder="Ex: Pizza de Calabresa" required />
                </div>
                {/* Seção de Upload de Imagem */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <label className="block mb-2 font-black text-slate-400 text-xs uppercase tracking-widest w-full">
                    Imagem do Produto
                  </label>
                  <div className="relative group w-full h-15 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 hover:border-orange-600 transition-all overflow-hidden flex items-center justify-center">

                    {editingItem?.imagem ? (
                      <>
                        <img
                          src={editingItem.imagem}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 z-10">
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center text-white cursor-pointer"
                          >
                            <Upload size={32} />
                            <span className="text-[10px] font-black uppercase mt-1">Trocar</span>
                          </div>

                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="flex flex-col items-center text-red-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={32} />
                            <span className="text-[10px] font-black uppercase mt-1">Remover</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-center text-slate-400 group-hover:text-orange-600 transition-colors">
                          <ImageIcon size={15} className="mb-2" />
                          <span className="text-xs font-bold uppercase tracking-widest">
                            Clique para enviar
                          </span>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                      </>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-black text-slate-400 text-xs uppercase tracking-widest">Preço (R$)</label>
                    <input type="number" step="0.01" value={editingItem?.preco || ""} onChange={e => setEditingItem(prev => ({ ...prev, preco: Number(e.target.value) }))} className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-bold focus:border-orange-600 outline-none transition" placeholder="0.00" required />
                  </div>
                  <div>
                    <label className="block mb-2 font-black text-slate-400 text-xs uppercase tracking-widest">Categoria</label>
                    <select
                      value={editingItem?.categoria || (categorias[0]?.nome || "")}
                      onChange={e => setEditingItem(prev => ({ ...prev, categoria: e.target.value }))}
                      className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-bold focus:border-orange-600 outline-none transition"
                    >
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-black text-slate-400 text-xs uppercase tracking-widest">Descrição</label>
                  <textarea value={editingItem?.descricao || ""} onChange={e => setEditingItem(prev => ({ ...prev, descricao: e.target.value }))} className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-bold focus:border-orange-600 outline-none transition resize-none" rows={3} placeholder="Descreva os ingredientes..." />
                </div>
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-50">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-full bg-slate-100 font-black text-slate-500 hover:bg-slate-200 transition text-sm uppercase tracking-widest">Cancelar</button>
                  <button type="submit" className="px-8 py-4 rounded-full bg-orange-600 text-white font-black hover:bg-orange-700 transition shadow-lg shadow-orange-200 text-sm uppercase tracking-widest">Salvar Item</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
