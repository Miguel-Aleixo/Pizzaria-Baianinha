import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, User, Phone, ArrowRight } from 'lucide-react';

interface ModalIdentificacaoProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (info: { nome: string; telefone: string }) => void;
}

export function ModalIdentificacao({ isOpen, onClose, onSave }: ModalIdentificacaoProps) {
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');

    const handleSave = () => {
        if (nome.trim() && telefone.trim()) {
            const info = { nome: nome.trim(), telefone: telefone.trim() };

            // Salva no localStorage
            localStorage.setItem("cliente-info", JSON.stringify(info));

            // Atualiza o estado no componente pai
            onSave(info);

            // Fecha o modal
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white w-full max-w-md rounded-4xl shadow-2xl overflow-hidden"
                    >
                        {/* Header com Gradiente */}
                        <div className="bg-linear-to-r from-orange-500 to-orange-600 p-8 text-center text-white relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
                            >
                                <X size={20} />
                            </button>
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                                <MessageCircle size={32} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">Quase lá!</h2>
                            <p className="text-orange-100 text-sm mt-1">Identifique-se para acompanhar seu pedido</p>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Campo Nome */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                                    <User size={14} /> Como podemos te chamar?
                                </label>
                                <input
                                    type="text"
                                    placeholder="Seu nome completo"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-slate-700"
                                />
                            </div>

                            {/* Campo WhatsApp */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                                    <Phone size={14} /> Seu WhatsApp
                                </label>
                                <input
                                    type="tel"
                                    placeholder="(00) 00000-0000"
                                    value={telefone}
                                    onChange={(e) => setTelefone(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-slate-700"
                                />
                                <p className="text-[10px] text-slate-400 italic ml-1">
                                    * Enviaremos atualizações automáticas sobre o status da sua pizza.
                                </p>
                            </div>

                            {/* Botão de Ação */}
                            <button
                                onClick={handleSave}
                                disabled={!nome || !telefone}
                                className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${nome && telefone
                                        ? "bg-orange-600 text-white shadow-orange-200 hover:bg-orange-700"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    }`}
                            >
                                Confirmar e Continuar <ArrowRight size={20} />
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full text-slate-400 font-bold text-sm hover:text-slate-600 transition"
                            >
                                Pular por enquanto
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
