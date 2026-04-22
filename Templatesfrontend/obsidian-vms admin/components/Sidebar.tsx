import React from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  Users, 
  MessageSquare, 
  AlertCircle, 
  CalendarDays, 
  CreditCard, 
  Settings, 
  LogOut,
  FolderOpen
} from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  
  const navItems: { id: ViewState; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mechanics', label: 'Mechanic List', icon: Wrench },
    { id: 'users', label: 'User List', icon: Users },
    { id: 'feedbacks', label: 'Feedbacks', icon: MessageSquare },
    { id: 'complaints', label: 'View Complaints', icon: AlertCircle },
    { id: 'bookings', label: 'All Bookings', icon: CalendarDays },
    { id: 'payments', label: 'All Payments', icon: CreditCard },
  ];

  return (
    <aside className="w-72 h-screen fixed left-0 top-0 bg-black/40 backdrop-blur-3xl border-r border-white/5 flex flex-col z-50">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FolderOpen className="text-white" size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
            Obsidian<span className="font-light">VMS</span>
          </h1>
        </div>
        
        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 px-2">
          Main Module
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`
              w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group
              ${currentView === item.id 
                ? 'bg-white/10 text-white shadow-lg shadow-white/5 border border-white/10' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <item.icon 
              size={20} 
              className={`transition-colors duration-300 ${currentView === item.id ? 'text-indigo-400' : 'text-neutral-500 group-hover:text-indigo-300'}`} 
            />
            <span className="font-medium text-sm">{item.label}</span>
            {currentView === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button className="w-full flex items-center gap-4 px-4 py-3 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <Settings size={20} />
          <span className="font-medium text-sm">Settings</span>
        </button>
        <button className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all mt-1">
          <LogOut size={20} />
          <span className="font-medium text-sm">Log Out</span>
        </button>
      </div>
    </aside>
  );
};