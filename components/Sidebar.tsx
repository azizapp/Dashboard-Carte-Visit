import React, { useState } from 'react';
import HomeIcon from './icons/HomeIcon.tsx';
import UsersIcon from './icons/UsersIcon.tsx';
import ChartBarIcon from './icons/ChartBarIcon.tsx';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon.tsx';
import LogoutIcon from './icons/LogoutIcon.tsx';
import CalendarDaysIcon from './icons/CalendarDaysIcon.tsx';
import ChevronLeftIcon from './icons/ChevronLeftIcon.tsx';
import SettingsIcon from './icons/SettingsIcon.tsx';
import PaintBrushIcon from './icons/PaintBrushIcon.tsx';
import DocumentTextIcon from './icons/DocumentTextIcon.tsx';
import XMarkIcon from './icons/XMarkIcon.tsx';

interface SidebarProps {
  onLogout: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
  isAdmin: boolean;
  userRole?: string;
  appName?: string;
  appIcon?: string; 
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const NavLink: React.FC<{
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  active?: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}> = ({ icon: Icon, label, active, onClick, isCollapsed }) => (
  <li>
    <a 
      href="#" 
      onClick={(e) => { e.preventDefault(); onClick(); }} 
      className={`flex items-center py-3 rounded-lg transition-all duration-200 text-sm font-medium relative group
        ${active ? 'bg-accent text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'}
        ${isCollapsed ? 'justify-center px-2' : 'px-4'}
      `}
    >
      <Icon className={`w-6 h-6 flex-shrink-0 transition-all duration-200 ${!isCollapsed ? 'mr-3' : ''}`} />
      
      <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
        {label}
      </span>

      {isCollapsed && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg lg:block hidden">
          {label}
        </div>
      )}
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  onLogout, currentView, onViewChange, isAdmin, userRole, appName = 'Apollo', appIcon,
  isMobileOpen, onCloseMobile 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const navItems = isAdmin ? [
    { id: 'dashboard', label: 'Tableau de Bord', icon: HomeIcon },
    { id: 'appointments', label: 'Rendez-Vous', icon: CalendarDaysIcon },
    { id: 'leads', label: 'Gestion des Leads', icon: UsersIcon },
    { id: 'transactions', label: 'Transactions', icon: DocumentTextIcon },
    { id: 'analytics', label: 'Analyses', icon: ChartBarIcon },
    { id: 'commissions', label: 'Suivi Commercial', icon: CurrencyDollarIcon },
    { id: 'settings', label: 'Réglages', icon: SettingsIcon }
  ] : [
    { id: 'user_home', label: 'Ma Page', icon: HomeIcon },
    { id: 'appointments', label: 'Mes Rendez-vous', icon: CalendarDaysIcon },
    { id: 'leads', label: 'Mes Prospects', icon: UsersIcon },
    { id: 'settings', label: 'Réglages', icon: SettingsIcon },
  ];

  if (userRole === 'manager') {
    navItems.push({ id: 'white_label', label: 'Configuration', icon: PaintBrushIcon });
  }

  const Logo = () => (
    <div className="w-10 h-10 flex items-center justify-center bg-transparent overflow-hidden">
      {appIcon ? (
        <img src={appIcon} alt="Logo" className="w-full h-full object-contain" />
      ) : (
        <div className="w-full h-full bg-accent rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-accent/20">
           {appName.charAt(0)}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden backdrop-blur-sm animate-in fade-in duration-300"
          onClick={onCloseMobile}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-[100] lg:static lg:flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-[260px]'}
          w-[260px] shadow-2xl lg:shadow-none
        `}
      >
        <div className={`p-4 flex items-center ${isCollapsed ? 'lg:justify-center justify-between' : 'justify-between'} border-b border-slate-200 dark:border-slate-700 h-[73px]`}>
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : 'w-auto opacity-100'}`}>
            <Logo />
            <h1 className="text-lg font-bold text-slate-800 dark:text-white whitespace-nowrap">{appName}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop Collapse Toggle */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors lg:block hidden"
            >
              <ChevronLeftIcon className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile Close Button */}
            <button 
              onClick={onCloseMobile}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors lg:hidden"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto overflow-x-hidden">
          <ul className="space-y-2">
            {navItems.map(item => (
              <NavLink
                key={item.id}
                label={item.label}
                icon={item.icon}
                active={currentView === item.id}
                onClick={() => onViewChange(item.id)}
                isCollapsed={isCollapsed}
              />
            ))}
          </ul>
        </nav>

        <div className="p-3 mt-auto border-t border-slate-200 dark:border-slate-700">
          <button 
            onClick={onLogout} 
            className={`w-full flex items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors duration-200 group relative
              ${isCollapsed ? 'lg:justify-center p-3' : 'px-4 py-3'}
              px-4 py-3
            `}
          >
            <LogoutIcon className={`w-5 h-5 flex-shrink-0 ${(!isCollapsed || isMobileOpen) ? 'mr-3' : ''}`} />
            
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100 font-semibold text-sm'}`}>
              Déconnexion
            </span>

            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg lg:block hidden">
                Déconnexion
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;