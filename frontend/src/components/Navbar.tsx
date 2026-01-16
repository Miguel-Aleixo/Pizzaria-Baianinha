"use client";

import { ShoppingCart, Pizza } from "lucide-react";

export default function Navbar({ cartCount }: { cartCount: number }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Pizza className="text-orange-600 w-8 h-8" />
          <span className="text-2xl font-black text-orange-600 tracking-tighter">BAIANINHA</span>
        </div>
        <div className="flex items-center gap-8 font-medium text-gray-600">
          <a href="#" className="hover:text-orange-600 hidden md:flex transition">Início</a>
          <a href="#menu" className="hover:text-orange-600 hidden md:flex transition">Cardápio</a>
          <a href="#" className="hover:text-orange-600 hidden md:flex transition">Sobre</a>
          <button className="relative p-2 hover:bg-orange-50 rounded-full transition">
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
  );
}
