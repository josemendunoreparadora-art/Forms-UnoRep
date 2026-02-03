
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-black text-[#D4AF37] px-6 py-5 sticky top-0 z-50 shadow-2xl border-b border-[#D4AF37]/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-black text-xl shadow-inner border-2 border-white/20">
              UN
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">
                UNO <span className="text-white">REPARADORA</span>
              </h1>
              <p className="text-[9px] font-bold text-white/50 tracking-[0.2em] uppercase mt-1">UnoRep Forms IA • UNOREP CORE</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_8px_#D4AF37]"></span>
              <span className="text-[10px] font-black uppercase text-white tracking-widest">Sistema IA Activo</span>
            </div>
            <p className="text-[8px] text-[#D4AF37] font-bold mt-1 uppercase tracking-tighter">Google IA Studio Collab</p>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      <footer className="py-10 px-6 bg-black text-white/40 border-t border-[#D4AF37]/20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-2">Créditos Institucionales</p>
            <p className="text-sm font-bold text-white mb-1 tracking-tight italic">Dpto. Inteligencia Artificial UNOREP CORE</p>
            <p className="text-xs text-white/60">Desarrollado en colaboración estratégica con Google IA Studio.</p>
            <p className="text-[9px] mt-4 font-bold text-[#D4AF37]/60 tracking-[0.3em] uppercase">PROYECTO UNIVERSITARIO • UNORC</p>
          </div>
          <div className="text-left md:text-right text-[10px] font-medium leading-relaxed">
            <p>© 2024 UNO REPARADORA. Todos los derechos reservados.</p>
            <p className="text-[#D4AF37] font-bold uppercase tracking-widest">Tecnología UnoRep Forms IA de Alta Precisión.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
