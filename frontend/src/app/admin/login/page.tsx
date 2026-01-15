"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, Pizza } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3005/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("admin-token", data.token);
        router.push("/admin");
      } else {
        setError("Credenciais inválidas. Tente novamente.");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-3xl p-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="bg-orange-100 p-4 rounded-2xl text-orange-600 mb-4">
            <Pizza size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">ADMIN LOGIN</h1>
          <p className="text-slate-500 font-medium">Pizzaria Baianinha</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Usuário</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition"
                placeholder="Seu usuário"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition"
                placeholder="Sua senha"
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm font-bold text-center"
            >
              {error}
            </motion.p>
          )}

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar no Painel"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a href="/" className="text-slate-400 hover:text-slate-600 font-bold text-sm transition">
            Voltar para o site
          </a>
        </div>
      </motion.div>
    </div>
  );
}
