import { motion, AnimatePresence } from "framer-motion";

export function PedidoConfirmado({ open }: { open: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/60 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-white rounded-[40px] px-10 py-12 w-[92%] max-w-sm shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] text-center relative overflow-hidden"
          >
            {/* Brilho de fundo */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-100 blur-[60px] opacity-50 rounded-full" />

            {/* Animação da Entrega */}
            <div className="relative h-28 mb-8 flex items-end justify-center">
              {/* Linha da estrada */}
              <div className="absolute bottom-2 left-0 right-0 h-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-1/2 h-full bg-orange-200"
                />
              </div>

              {/* Casa com efeito de "chegada" */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute right-4 bottom-4 text-5xl z-10"
              >
                🏠
              </motion.div>

              {/* Pizza Viajante */}
              <motion.div
                initial={{ x: -140 }}
                animate={{ 
                  x: [ -140, 60, 55 ], // Vai até a casa e dá uma pequena freada
                  rotate: [ 0, 15, 0 ],
                  y: [ 0, -8, 0 ]
                }}
                transition={{ 
                  duration: 2, 
                  times: [0, 0.8, 1],
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
                className="absolute left-1/2 -translate-x-1/2 bottom-4 text-5xl z-20"
              >
                <span className="relative inline-block">
                  🍕
                  {/* Efeito de fumaça/velocidade */}
                  <motion.span 
                    animate={{ opacity: [0, 1, 0], x: [-10, -30], scale: [0.5, 1.2] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="absolute -left-4 top-1/2 text-xl"
                  >
                    💨
                  </motion.span>
                </span>
              </motion.div>
            </div>

            {/* Textos com animação de cascata */}
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="inline-block bg-green-100 text-green-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4"
              >
                Sucesso!
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black text-slate-900 leading-tight"
              >
                Pedido   
 Confirmado!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-slate-500 mt-4 font-medium px-4"
              >
                Prepare a mesa! Sua pizza está sendo preparada com carinho.
              </motion.p>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 3 }}
                className="h-1.5 bg-orange-500 rounded-full mt-8 mx-auto"
              />
              <p className="text-[10px] text-slate-300 uppercase font-bold mt-2 tracking-widest">
                Acompanhe pelo WhatsApp
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
