import React, { useState, useEffect } from 'react';
import { Store, Mode, StoreFormData, Customer, AppSettings, UserSession } from './types.ts';
import storeService from './services/storeService.ts';
import settingsService from './services/settingsService.ts';
import LoginPage from './components/LoginPage.tsx';
import DashboardPage from './components/DashboardPage.tsx';
import AnalyticsDashboard from './components/AnalyticsDashboard.tsx';
import AdminProspectDetailPage from './components/AdminProspectDetailPage.tsx';
import UserProspectDetailPage from './components/distributor/UserProspectDetailPage.tsx';
import HomePage from './components/HomePage.tsx';
import CommissionsPage from './components/CommissionsPage.tsx';
import AdminSettingsPage from './components/AdminSettingsPage.tsx';
import DistributorSettingsPage from './components/distributor/DistributorSettingsPage.tsx';
import SpinnerIcon from './components/icons/SpinnerIcon.tsx';
import Sidebar from './components/Sidebar.tsx';
import CustomerEditModal from './components/CustomerEditModal.tsx';
import WhiteLabelPage from './components/WhiteLabelPage.tsx';

import UserDashboard from './components/distributor/UserDashboard.tsx';
import StoreFormPage from './components/distributor/StoreFormPage.tsx';
import AppointmentsPage from './components/distributor/AppointmentsPage.tsx';
import FollowUpPage from './components/distributor/FollowUpPage.tsx';

const App: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'manager' | 'admin' | 'user'>('user');
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [followUpStore, setFollowUpStore] = useState<Store | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [font, setFont] = useState('Inter');
  const [fontSize, setFontSize] = useState('16');
  const [fontWeight, setFontWeight] = useState('400');
  const [accentColor, setAccentColor] = useState('#4f46e5');
  const [mode, setMode] = useState<Mode>(Mode.Production);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const isAdminOrManager = userRole === 'admin' || userRole === 'manager';

  useEffect(() => {
    const initApp = async () => {
      const settings = await settingsService.getSettings();
      if (settings) {
        setAppSettings(settings);
        settingsService.applySettings(settings);
        setAccentColor(settings.accent_color);
      }

      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
      const savedFont = localStorage.getItem('font') || 'Inter';
      const savedFontSize = localStorage.getItem('fontSize') || '16';
      const savedFontWeight = localStorage.getItem('fontWeight') || '400';
      const sessionUser = localStorage.getItem('authenticatedUser');
      const sessionRole = localStorage.getItem('userRole') as 'manager' | 'admin' | 'user';

      setTheme(savedTheme);
      setFont(savedFont);
      setFontSize(savedFontSize);
      setFontWeight(savedFontWeight);

      if (savedTheme === 'dark') document.documentElement.classList.add('dark');

      document.documentElement.style.setProperty('--app-font', savedFont);
      document.documentElement.style.setProperty('--app-font-size', `${savedFontSize}px`);
      document.documentElement.style.setProperty('--app-font-weight', savedFontWeight);

      if (sessionUser && sessionRole) {
        setAuthenticatedUser(sessionUser);
        setUserRole(sessionRole);
        
        if (sessionRole === 'user') {
          setCurrentView('user_home');
        } else if (sessionRole === 'manager') {
          setCurrentView('white_label');
        } else {
          setCurrentView('dashboard');
        }
      }

      // إبقاء الـ Splash Screen ظاهرة لثانية إضافية لإعطاء شعور احترافي
      setTimeout(() => setIsLoading(false), 1200);
    };

    initApp();

    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const syncData = async () => {
    if (!authenticatedUser) return;
    setIsLoading(true);
    try {
      const freshStores = await storeService.syncStores(Mode.Production);
      setStores(freshStores);
      const settings = await settingsService.getSettings();
      if (settings) {
        setAppSettings(settings);
        settingsService.applySettings(settings);
      }
    } catch (e: any) {
      console.error(e);
      setStores(storeService.getStoredStores());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authenticatedUser) syncData();
  }, [authenticatedUser]);

  const handleLoginSuccess = (session: UserSession) => {
    setAuthenticatedUser(session.email);
    setUserRole(session.role);
    localStorage.setItem('authenticatedUser', session.email);
    localStorage.setItem('userRole', session.role);
    
    if (session.role === 'user') {
      setCurrentView('user_home');
    } else if (session.role === 'manager') {
      setCurrentView('white_label');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authenticatedUser');
    localStorage.removeItem('userRole');
    setAuthenticatedUser(null);
    setUserRole('user');
    setCurrentView('dashboard');
  };

  const handleOptimisticUpdate = (newStore: Store) => {
    setStores(prev => [newStore, ...prev]);
    storeService.addToLocalCache(newStore);
  };

  const handleAddStore = async (newStoreData: StoreFormData) => {
    try {
      await storeService.addStore(Mode.Production, newStoreData, undefined, authenticatedUser || undefined);
      alert("Enregistré avec succès !");
      setCurrentView(isAdminOrManager ? 'dashboard' : 'user_home');
      await syncData();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setIsEditModalOpen(true);
  };

  const handleSaveCustomer = async (customerId: string, data: Partial<Customer>) => {
    try {
      await storeService.updateCustomer(customerId, data);
      await syncData();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const updateTheme = (t: 'light' | 'dark') => {
    setTheme(t);
    localStorage.setItem('theme', t);
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const resetSettings = () => {
    setFont('Inter');
    setFontSize('16');
    setFontWeight('400');
    setAccentColor('#4f46e5');
    updateTheme('light');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#0f172a] transition-all duration-700">
        <div className="relative w-32 h-32 mb-8 animate-in fade-in zoom-in duration-1000">
          {appSettings?.splash_url ? (
            <img src={appSettings.splash_url} alt="Splash" className="w-full h-full object-contain drop-shadow-2xl" />
          ) : (
            <div className="w-full h-full bg-accent rounded-3xl animate-pulse shadow-2xl"></div>
          )}
          <div className="absolute -bottom-2 -right-2">
            <SpinnerIcon className="animate-spin h-8 w-8 text-accent" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-white tracking-[0.2em] uppercase opacity-80">{appSettings?.short_name || 'Apollo'}</h1>
      </div>
    );
  }

  if (!authenticatedUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} appSettings={appSettings} />;
  }

  return (
    <div className="flex h-screen font-sans bg-[#F7F8FA] dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
        isAdmin={isAdminOrManager}
        userRole={userRole}
        appName={appSettings?.short_name || 'Apollo'}
        appIcon={appSettings?.icon_192_url}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {!(currentView === 'add_lead' || currentView === 'follow_up' || currentView === 'appointments' || currentView === 'details' || currentView === 'settings' || currentView === 'white_label') && (
          <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center h-[73px] flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <h2 className="font-bold text-slate-800 dark:text-white uppercase tracking-tighter">{appSettings?.app_name || 'Apollo Eyewear'}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{userRole}</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{authenticatedUser}</p>
              </div>
              <img src={`https://ui-avatars.com/api/?name=${authenticatedUser}&background=random&color=fff`} className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-700 shadow-sm mr-2" />
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto bg-[#F7F8FA] dark:bg-slate-900/50">
          {currentView === 'user_home' && userRole === 'user' && (
            <UserDashboard
              stores={stores}
              authenticatedUser={authenticatedUser}
              onAddLead={() => setCurrentView('add_lead')}
              onViewDetails={(s) => { setSelectedStore(s); setCurrentView('details'); }}
              onViewAppointments={() => setCurrentView('appointments')}
              onViewSettings={() => setCurrentView('settings')}
            />
          )}

          {(currentView === 'dashboard' || (currentView === 'user_home' && isAdminOrManager)) && isAdminOrManager && (
            <div className="p-4 md:p-6"><HomePage stores={stores} authenticatedUser={authenticatedUser} /></div>
          )}

          {currentView === 'add_lead' && (
            <StoreFormPage
              onClose={() => setCurrentView(isAdminOrManager ? 'dashboard' : 'user_home')}
              onSubmit={handleAddStore}
              stores={stores}
            />
          )}

          {currentView === 'follow_up' && followUpStore && (
            <FollowUpPage
              prospect={followUpStore}
              onClose={() => setCurrentView('details')}
              onSubmit={handleAddStore}
            />
          )}

          {currentView === 'leads' && isAdminOrManager && (
            <div className="p-4 md:p-6">
              <DashboardPage
                stores={stores}
                authenticatedUser={authenticatedUser}
                isLoading={isLoading}
                onViewDetails={(s) => { setSelectedStore(s); setCurrentView('details'); }}
                onEdit={handleEditStore}
                isAdmin={isAdminOrManager}
              />
            </div>
          )}

          {currentView === 'details' && selectedStore && (
            isAdminOrManager ? (
              <AdminProspectDetailPage
                store={selectedStore}
                history={stores.filter(s => s.Magazin.trim().toLowerCase() === selectedStore.Magazin.trim().toLowerCase())}
                onClose={() => setCurrentView('leads')}
                onEdit={handleEditStore}
                onOptimisticUpdate={handleOptimisticUpdate}
                authenticatedUser={authenticatedUser || ''}
              />
            ) : (
              <UserProspectDetailPage
                store={selectedStore}
                history={stores.filter(s => s.Magazin.trim().toLowerCase() === selectedStore.Magazin.trim().toLowerCase())}
                onClose={() => setCurrentView('user_home')}
                onAddVisit={(s) => { setFollowUpStore(s); setCurrentView('follow_up'); }}
                onEdit={handleEditStore}
              />
            )
          )}

          {currentView === 'appointments' && (
            <AppointmentsPage
              stores={stores}
              isAdmin={isAdminOrManager}
              authenticatedUser={authenticatedUser || ''}
              onClose={() => setCurrentView(isAdminOrManager ? 'dashboard' : 'user_home')}
              onViewDetails={(s) => { setSelectedStore(s); setCurrentView('details'); }}
              onOptimisticUpdate={handleOptimisticUpdate}
              onEditStore={handleEditStore}
              onRefresh={syncData}
            />
          )}

          {currentView === 'analytics' && isAdminOrManager && <div className="p-4 md:p-6"><AnalyticsDashboard stores={stores} /></div>}
          {currentView === 'commissions' && isAdminOrManager && <div className="p-4 md:p-6"><CommissionsPage stores={stores} /></div>}

          {currentView === 'settings' && (
            isAdminOrManager ? (
              <AdminSettingsPage
                userRole={userRole}
                theme={theme}
                setTheme={updateTheme}
                font={font}
                setFont={setFont}
                fontSize={fontSize}
                setFontSize={setFontSize}
                fontWeight={fontWeight}
                setFontWeight={setFontWeight}
                accentColor={accentColor}
                setAccentColor={setAccentColor}
                mode={mode}
                setMode={setMode}
                onRefresh={syncData}
                isLoading={isLoading}
                onClose={() => setCurrentView('dashboard')}
                onResetSettings={resetSettings}
                appSettings={appSettings}
              />
            ) : (
              <DistributorSettingsPage
                authenticatedUser={authenticatedUser || ''}
                theme={theme}
                setTheme={updateTheme}
                font={font}
                setFont={setFont}
                fontSize={fontSize}
                setFontSize={setFontSize}
                fontWeight={fontWeight}
                setFontWeight={setFontWeight}
                accentColor={accentColor}
                setAccentColor={setAccentColor}
                mode={mode}
                setMode={setMode}
                onRefresh={syncData}
                isLoading={isLoading}
                onLogout={handleLogout}
                onClose={() => setCurrentView('user_home')}
                onResetSettings={resetSettings}
              />
            )
          )}

          {currentView === 'white_label' && userRole === 'manager' && (
            <WhiteLabelPage
              appSettings={appSettings}
              onClose={() => setCurrentView('dashboard')}
              setAccentColor={setAccentColor}
            />
          )}
        </main>
      </div>

      <CustomerEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        store={editingStore}
        onSave={handleSaveCustomer}
        isAdmin={isAdminOrManager}
      />
    </div>
  );
};

export default App;