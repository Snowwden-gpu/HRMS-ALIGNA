
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CalendarRange, 
  CreditCard, 
  BarChart3, 
  UserCircle, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Search,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, active, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
      active 
        ? 'bg-[#059669] text-white shadow-lg shadow-emerald-200' 
        : 'text-slate-500 hover:bg-[#f0f9f1] hover:text-emerald-700'
    }`}
  >
    <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600 transition-colors'}`}>{icon}</span>
    <span className="font-bold text-[13px] tracking-tight">{label}</span>
    {active && <ChevronRight size={14} className="ml-auto opacity-70" />}
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode; user: any; onLogout: () => void }> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview', roles: [UserRole.ADMIN, UserRole.EMPLOYEE] },
    { to: '/employees', icon: <Users size={20} />, label: 'Organization', roles: [UserRole.ADMIN] },
    { to: '/attendance', icon: <Clock size={20} />, label: 'Attendance', roles: [UserRole.ADMIN, UserRole.EMPLOYEE] },
    { to: '/leaves', icon: <CalendarRange size={20} />, label: 'Leave Application', roles: [UserRole.ADMIN, UserRole.EMPLOYEE] },
    { to: '/payroll', icon: <CreditCard size={20} />, label: 'Payroll', roles: [UserRole.ADMIN, UserRole.EMPLOYEE] },
    { to: '/analytics', icon: <BarChart3 size={20} />, label: 'Intelligence', roles: [UserRole.ADMIN] },
    { to: '/profile', icon: <UserCircle size={20} />, label: 'Identity', roles: [UserRole.ADMIN, UserRole.EMPLOYEE] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0fdf4]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-teal-900/20 backdrop-blur-md lg:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white transform transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 m-4 rounded-[32px] shadow-premium ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+2rem)]'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10 px-2 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#059669] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <span className="text-white font-bold text-xl leading-none">A</span>
              </div>
              <span className="text-[20px] font-black tracking-tighter text-teal-900">Aligna</span>
            </div>
            <button className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-xl" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto">
            <p className="px-5 pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Platform Console</p>
            {filteredItems.map(item => (
              <SidebarItem 
                key={item.to}
                {...item}
                active={location.pathname === item.to}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-50">
            <button 
              onClick={onLogout}
              className="flex items-center gap-4 w-full px-5 py-4 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all duration-300 group"
            >
              <LogOut size={20} />
              <span className="font-bold text-[13px] tracking-tight">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-[80px] bg-transparent flex items-center justify-between px-8 lg:px-12 shrink-0 z-20">
          <div className="flex items-center gap-6">
            <button className="lg:hidden p-3 bg-white shadow-soft rounded-2xl text-slate-600" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="hidden sm:flex items-center bg-white/60 backdrop-blur-md rounded-2xl px-5 py-2.5 border border-white/40 w-[320px] shadow-soft focus-within:bg-white transition-all duration-300">
               <Search size={16} className="text-slate-400 mr-3" />
               <input placeholder="Deep search directory..." className="bg-transparent border-none text-[13px] w-full focus:outline-none placeholder:text-slate-300 font-medium" />
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <button className="relative p-3 bg-white shadow-soft text-slate-500 rounded-2xl hover:text-emerald-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="flex items-center gap-4 pl-8 border-l border-emerald-100">
              <div className="hidden md:block text-right">
                <p className="text-[14px] font-bold text-teal-900 leading-none">{user.profile.fullName}</p>
                <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mt-1.5 flex items-center gap-1 justify-end">
                  <Sparkles size={10} /> {user.role === UserRole.ADMIN ? 'HR Manager' : user.profile.position}
                </p>
              </div>
              <img 
                src={user.profile.avatar} 
                alt="Profile" 
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-white shadow-soft"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 lg:p-12 pt-4 page-enter">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
