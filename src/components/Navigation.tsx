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
      <nav className="bg-[#0a0a0a] border-b border-zinc-800 flex justify-around sm:justify-center sm:gap-8 px-2 py-1 shadow-md">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 py-2.5 px-4 sm:px-6 font-bold text-xs uppercase tracking-wider transition-all border-b-2 font-heading ${
                isActive
                  ? 'border-[#bbff00] text-[#bbff00] font-black scale-105'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className={isActive ? 'text-[#bbff00]' : 'text-zinc-400'}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Floating Bottom Nav for mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-zinc-800/80 sm:hidden flex justify-around py-2.5 px-1 shadow-2xl">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 flex-1 py-1 text-[10px] uppercase font-bold tracking-wider font-heading transition-all ${
                isActive ? 'text-[#bbff00] font-black' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-[#bbff00] text-[#0a0a0a] shadow-md shadow-[#bbff00]/20' : ''}`}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
