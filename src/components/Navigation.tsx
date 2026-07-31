import React from 'react';
import { Dumbbell, Calendar, LineChart, Library } from 'lucide-react';

export type TabType = 'workout' | 'calendar' | 'stats' | 'library';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'workout', label: 'Séance', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendrier', icon: <Calendar className="w-4 h-4" /> },
    { id: 'stats', label: 'Progrès', icon: <LineChart className="w-4 h-4" /> },
    { id: 'library', label: 'Exercices', icon: <Library className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Top Tab Bar for desktop / wide screens */}
      <nav className="bg-white/60 backdrop-blur-xl border-b border-white/80 hidden sm:flex justify-center gap-8 px-2 py-1 shadow-sm">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 py-2.5 px-6 font-bold text-xs uppercase tracking-wider transition-all border-b-2 font-heading active:scale-95 ${
                isActive
                  ? 'border-[#0a0a0a] text-[#0a0a0a] font-black scale-105'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className={isActive ? 'text-[#0a0a0a]' : 'text-slate-400'}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Floating Bottom Nav for mobile with high-contrast touch targets */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-xl border-t border-white/80 sm:hidden flex justify-around py-2 px-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 min-h-[48px] py-1 text-[10px] uppercase font-bold tracking-wider font-heading transition-all active:scale-90 ${
                isActive ? 'text-[#0a0a0a] font-black' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#0a0a0a] text-[#bbff00] shadow-md shadow-[#0a0a0a]/20 scale-110'
                    : 'text-slate-500'
                }`}
              >
                {item.icon}
              </div>
              <span className={isActive ? 'font-black text-[#0a0a0a]' : 'font-semibold text-slate-500'}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};
