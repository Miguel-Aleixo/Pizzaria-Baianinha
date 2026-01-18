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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005"}/api/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("admin-token", data.token);
        router.push("/admin");
      } else {
        setError("Usuário ou senha inválidos.");
      }
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-6">
      
      {/* Glow decorativo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-120 h-120 bg-orange-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="
          relative w-full max-w-md
          rounded-3xl
          bg-white/95 backdrop-blur-xl
          shadow-[0_40px_120px_-40px_rgba(0,0,0,0.6)]
          p-10
        "
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-inner">
            <Pizza size={28} />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Painel Administrativo
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Pizzaria Baianinha
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
              Usuário
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                className="
                  w-full rounded-2xl border border-slate-200
                  pl-11 pr-4 py-4
                  text-sm font-medium
                  focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20
                  outline-none transition
                "
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
              Senha
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="
                  w-full rounded-2xl border border-slate-200
                  pl-11 pr-4 py-4
                  text-sm font-medium
                  focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20
                  outline-none transition
                "
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-semibold text-red-600 text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="
              w-full rounded-2xl py-4
              bg-orange-600 text-white
              font-black tracking-wide
              hover:bg-orange-700
              transition-all
              shadow-xl shadow-orange-600/20
              disabled:opacity-50
            "
          >
            {loading ? "Autenticando..." : "Entrar no Painel"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition"
          >
            ← Voltar para o site
          </a>
        </div>
      </motion.div>
    </div>
  );
}
