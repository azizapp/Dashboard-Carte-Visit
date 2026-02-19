import React, { useState, useEffect, useMemo } from 'react';
import { Mode, AppSettings, UserSession, Store, Customer } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import LoginPage from './components/LoginPage.tsx';
import HomePage from './components/HomePage.tsx';
import DashboardPage from './components/DashboardPage.tsx';
import AdminSettingsPage from './components/AdminSettingsPage.tsx';
import DistributorSettingsPage from './components/distributor/DistributorSettingsPage.tsx';
import StoreFormPage from './components/distributor/StoreFormPage.tsx';
import FollowUpPage from './components/distributor/FollowUpPage.tsx';
import AppointmentsPage from './components/distributor/AppointmentsPage.tsx';
import MapPage from './components/MapPage.tsx';
import CommissionsPage from './components/CommissionsPage.tsx';
import AnalyticsDashboard from './components/AnalyticsDashboard.tsx';
import WhiteLabelPage from './components/WhiteLabelPage.tsx';
import AdminProspectDetailPage from './components/AdminProspectDetailPage.tsx';
import UserDashboard from './components/distributor/UserDashboard.tsx';
import UserProspectDetailPage from './components/distributor/UserProspectDetailPage.tsx';
import AdminTransactionsPage from './components/AdminTransactionsPage.tsx';
import CustomerEditModal from './components/CustomerEditModal.tsx';
import settingsService from './services/settingsService.ts';
import storeService from './services/storeService.ts';

const App: React.FC = () => {
  // Authentication & Session State
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('user-session');
      if (!saved) return null;
      // Protection contre les erreurs de type "[object Object]" stockées par accident
      if (saved === "[object Object]") {
        localStorage.removeItem('user-session');
        return null;
      }
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse user session", e);
      return null;
    }
  });

  // App Configuration State
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark');
  const [font, setFont] = useState(() => localStorage.getItem('font') || 'Inter');
  const [accentColor, setAccentColor] = useState('#4f46e5');

  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data State
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>(Mode.Production);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);

  // User Context
  const userRole = session?.role;
  const authenticatedUser = session?.email || '';
  const isAdmin = userRole === 'admin' || userRole === 'manager';

  // Load Initial Settings
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await settingsService.getSettings();
      if (settings) {
        setAppSettings(settings);
        setAccentColor(settings.accent_color);
        settingsService.applySettings(settings);
      }
    };
    loadSettings();
  }, []);

  // Apply Theme & Font to DOM
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font', font);
    localStorage.setItem('font', font);
  }, [font]);

  // Data Sync Logic
  const syncData = async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const data = await storeService.syncStores(mode);
      setStores(data);
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Sync and View Selection
  useEffect(() => {
    if (session) {
      syncData();
      if (!isAdmin && currentView === 'dashboard') {
          setCurrentView('user_home');
      }
    }
  }, [session, mode]);

  // Handlers
  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    localStorage.setItem('user-session', JSON.stringify(newSession));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('user-session');
    setCurrentView('dashboard');
  };

  const handleAddStore = async (formData: any) => {
      setIsLoading(true);
      try {
          await storeService.addStore(mode, formData, undefined, authenticatedUser);
          await syncData();
          setCurrentView(isAdmin ? 'leads' : 'user_home');
      } catch (e) {
          alert("Erreur lors de l'enregistrement du prospect");
      } finally {
          setIsLoading(false);
      }
  };

  const handleViewDetails = (store: Store) => {
      setSelectedStore(store);
      setCurrentView('details');
  };

  const storeHistory = useMemo(() => {
      if (!selectedStore) return [];
      return stores.filter(s => s.Magazin.trim().toLowerCase() === selectedStore.Magazin.trim().toLowerCase())
          .sort((a, b) => new Date(b['Date Heure'] || b.Date).getTime() - new Date(a['Date Heure'] || a.Date).getTime());
  }, [stores, selectedStore]);

  if (!session) {
    return <LoginPage onLoginSuccess={handleLogin} appSettings={appSettings} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Sidebar
        onLogout={handleLogout}
        currentView={currentView}
        onViewChange={(v) => { setCurrentView(v); setIsMobileMenuOpen(false); }}
        isAdmin={isAdmin}
        userRole={userRole}
        appName={appSettings?.app_name}
        appIcon={appSettings?.icon_192_url}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile Header Overlay */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b dark:border-slate-700">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <span className="font-bold text-slate-800 dark:text-white">{appSettings?.short_name || 'Apollo'}</span>
            <div className="w-10"></div>
        </div>

        <div className="container mx-auto p-4 md:p-8">
            {/* View Dispatcher */}
            {currentView === 'dashboard' && isAdmin && (
                <HomePage stores={stores} authenticatedUser={authenticatedUser} />
            )}
            
            {currentView === 'leads' && isAdmin && (
                <DashboardPage 
                    stores={stores} 
                    authenticatedUser={authenticatedUser} 
                    isLoading={isLoading} 
                    onViewDetails={handleViewDetails}
                    onEdit={(s) => { setSelectedStore(s); setIsEditCustomerOpen(true); }}
                    isAdmin={isAdmin}
                />
            )}

            {currentView === 'user_home' && !isAdmin && (
                <UserDashboard 
                    stores={stores} 
                    authenticatedUser={authenticatedUser} 
                    onAddLead={() => setCurrentView('add_lead')}
                    onViewDetails={handleViewDetails}
                    onViewAppointments={() => setCurrentView('appointments')}
                    onViewSettings={() => setCurrentView('settings')}
                />
            )}

            {currentView === 'appointments' && (
                <AppointmentsPage 
                    stores={stores} 
                    onClose={() => setCurrentView(isAdmin ? 'dashboard' : 'user_home')} 
                    onViewDetails={handleViewDetails}
                    isAdmin={isAdmin}
                    authenticatedUser={authenticatedUser}
                    onOptimisticUpdate={(newStore) => setStores(prev => [newStore, ...prev])}
                    onRefresh={syncData}
                    onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
                />
            )}

            {currentView === 'analytics' && isAdmin && <AnalyticsDashboard stores={stores} />}
            {currentView === 'commissions' && isAdmin && <CommissionsPage stores={stores} />}
            {currentView === 'transactions' && isAdmin && <AdminTransactionsPage stores={stores} onRefresh={syncData} />}
            
            {currentView === 'settings' && (
                isAdmin ? (
                    <AdminSettingsPage
                        userRole={userRole}
                        theme={theme}
                        setTheme={setTheme}
                        font={font}
                        setFont={setFont}
                        accentColor={accentColor}
                        setAccentColor={setAccentColor}
                        onClose={() => setCurrentView('dashboard')}
                        onRefresh={syncData}
                        isLoading={isLoading}
                    />
                ) : (
                    <DistributorSettingsPage
                        authenticatedUser={authenticatedUser}
                        theme={theme}
                        setTheme={setTheme}
                        font={font}
                        setFont={setFont}
                        fontSize="16"
                        setFontSize={() => {}}
                        fontWeight="400"
                        setFontWeight={() => {}}
                        accentColor={accentColor}
                        setAccentColor={setAccentColor}
                        mode={mode}
                        setMode={setMode}
                        onRefresh={syncData}
                        isLoading={isLoading}
                        onLogout={handleLogout}
                        onClose={() => setCurrentView('user_home')}
                        onResetSettings={() => {}}
                    />
                )
            )}

            {currentView === 'white_label' && userRole === 'manager' && (
                <WhiteLabelPage
                    appSettings={appSettings}
                    onClose={() => setCurrentView('dashboard')}
                    setAccentColor={setAccentColor}
                    onSync={syncData}
                />
            )}

            {currentView === 'details' && selectedStore && (
                isAdmin ? (
                    <AdminProspectDetailPage 
                        store={selectedStore} 
                        history={storeHistory} 
                        onClose={() => setCurrentView('leads')}
                        onEdit={(s) => { setSelectedStore(s); setIsEditCustomerOpen(true); }}
                        onOptimisticUpdate={(newStore) => setStores(prev => [newStore, ...prev])}
                        authenticatedUser={authenticatedUser}
                    />
                ) : (
                    <UserProspectDetailPage 
                        store={selectedStore} 
                        history={storeHistory} 
                        onClose={() => setCurrentView('user_home')}
                        onAddVisit={() => setCurrentView('follow_up')}
                        onEdit={(s) => { setSelectedStore(s); setIsEditCustomerOpen(true); }}
                    />
                )
            )}

            {currentView === 'add_lead' && (
                <StoreFormPage 
                    onClose={() => setCurrentView(isAdmin ? 'leads' : 'user_home')} 
                    onSubmit={handleAddStore}
                    stores={stores}
                />
            )}

            {currentView === 'follow_up' && selectedStore && (
                <FollowUpPage 
                    prospect={selectedStore}
                    onClose={() => setCurrentView('details')}
                    onSubmit={handleAddStore}
                />
            )}

            <CustomerEditModal 
                isOpen={isEditCustomerOpen}
                onClose={() => setIsEditCustomerOpen(false)}
                store={selectedStore}
                onSave={async (id, data) => {
                    await storeService.updateCustomer(id, data);
                    await syncData();
                }}
                isAdmin={isAdmin}
            />
        </div>
      </main>
    </div>
  );
};

export default App;
