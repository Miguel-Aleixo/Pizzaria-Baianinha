"use client";

import { ShoppingCart, Pizza } from "lucide-react";
import { useState } from "react";

type NavbarProps = {
  cartCount: number;
  onToggle: () => void;
  isAberto: boolean
};


export default function Navbar({ cartCount, onToggle, isAberto }: NavbarProps) {

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Pizza className="text-orange-600 w-8 h-8" />
            <span className="text-2xl font-black text-orange-600 tracking-tighter">BAIANINHA</span>
          </div>
          <div className="flex items-center gap-8 font-medium text-gray-600">
            <a href="#" className="hover:text-orange-600 hidden md:flex transition">Início</a>
            <a href="#menu" className="hover:text-orange-600 hidden md:flex transition">Cardápio</a>
            <a href="#sobre" className="hover:text-orange-600 hidden md:flex transition">Sobre</a>
            <button
              disabled={!isAberto}
              className="relative p-2 hover:bg-orange-50 rounded-full transition"
              onClick={onToggle}>
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
      {!isAberto && (
        <div className="sticky top-18 z-50 bg-red-600 text-white text-center py-3 px-6 font-bold">
          Estamos fechados agora • Abrimos das 18h às 23h
        </div>
      )}
    </>
  );
}
