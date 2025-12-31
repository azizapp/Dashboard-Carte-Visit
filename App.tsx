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

import UserDashboard from './components/distributor/UserDashboard.tsx';
import StoreFormPage from './components/distributor/StoreFormPage.tsx';
import AppointmentsPage from './components/distributor/AppointmentsPage.tsx';
import FollowUpPage from './components/distributor/FollowUpPage.tsx';

const App: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
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

  useEffect(() => {
    const initApp = async () => {
      // تحميل إعدادات التخصيص أولاً
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
      const sessionRole = localStorage.getItem('userRole') as 'admin' | 'user';

      setTheme(savedTheme);
      setFont(savedFont);
      setFontSize(savedFontSize);
      setFontWeight(savedFontWeight);

      if (savedTheme === 'dark') document.documentElement.classList.add('dark');

      document.documentElement.style.setProperty('--app-font', savedFont);
      document.documentElement.style.setProperty('--app-font-size', `${savedFontSize}px`);
      document.documentElement.style.setProperty('--app-font-weight', savedFontWeight);

      if (sessionUser) {
        setAuthenticatedUser(sessionUser);
        const role = sessionRole || 'user';
        setUserRole(role);
        if (role === 'user' && currentView === 'dashboard') {
          setCurrentView('user_home');
        }
      }

      setIsLoading(false);
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
    setCurrentView(session.role === 'admin' ? 'dashboard' : 'user_home');
  };

  const handleLogout = () => {
    localStorage.removeItem('authenticatedUser');
    localStorage.removeItem('userRole');
    setAuthenticatedUser(null);
  };

  const handleOptimisticUpdate = (newStore: Store) => {
    setStores(prev => [newStore, ...prev]);
    storeService.addToLocalCache(newStore);
  };

  const handleAddStore = async (newStoreData: StoreFormData) => {
    try {
      await storeService.addStore(Mode.Production, newStoreData, undefined, authenticatedUser || undefined);
      alert("Enregistré avec succès !");
      setCurrentView(userRole === 'admin' ? 'dashboard' : 'user_home');
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

  if (isLoading && !authenticatedUser) {
    return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900"><SpinnerIcon className="animate-spin h-10 w-10 text-blue-600" /></div>;
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
        isAdmin={userRole === 'admin'}
        appName={appSettings?.short_name || 'Apollo'}
        appIcon={appSettings?.icon_192_url}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {!(currentView === 'add_lead' || currentView === 'follow_up' || currentView === 'appointments' || currentView === 'details' || currentView === 'settings') && (
          <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center h-[73px] flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <h2 className="font-bold text-slate-800 dark:text-white uppercase tracking-tighter">{appSettings?.app_name || 'Apollo Eyewear'}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase">{userRole}</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{authenticatedUser}</p>
              </div>
              <img src={`https://ui-avatars.com/api/?name=${authenticatedUser}&background=random&color=fff`} className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-700 shadow-sm mr-2" />
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto bg-[#F7F8FA] dark:bg-slate-900/50">
          {currentView === 'user_home' && (
            <UserDashboard
              stores={stores}
              authenticatedUser={authenticatedUser}
              onAddLead={() => setCurrentView('add_lead')}
              onViewDetails={(s) => { setSelectedStore(s); setCurrentView('details'); }}
              onViewAppointments={() => setCurrentView('appointments')}
              onViewSettings={() => setCurrentView('settings')}
            />
          )}

          {currentView === 'add_lead' && (
            <StoreFormPage
              onClose={() => setCurrentView(userRole === 'admin' ? 'dashboard' : 'user_home')}
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

          {currentView === 'dashboard' && <div className="p-4 md:p-6"><HomePage stores={stores} authenticatedUser={authenticatedUser} /></div>}

          {currentView === 'leads' && (
            <div className="p-4 md:p-6">
              <DashboardPage
                stores={stores}
                authenticatedUser={authenticatedUser}
                isLoading={isLoading}
                onViewDetails={(s) => { setSelectedStore(s); setCurrentView('details'); }}
                onEdit={handleEditStore}
                isAdmin={userRole === 'admin'}
              />
            </div>
          )}

          {currentView === 'details' && selectedStore && (
            userRole === 'admin' ? (
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
              isAdmin={userRole === 'admin'}
              authenticatedUser={authenticatedUser || ''}
              onClose={() => setCurrentView(userRole === 'admin' ? 'dashboard' : 'user_home')}
              onViewDetails={(s) => { setSelectedStore(s); setCurrentView('details'); }}
              onOptimisticUpdate={handleOptimisticUpdate}
              onEditStore={handleEditStore}
              onRefresh={syncData}
            />
          )}

          {currentView === 'analytics' && <div className="p-4 md:p-6"><AnalyticsDashboard stores={stores} /></div>}
          {currentView === 'commissions' && <div className="p-4 md:p-6"><CommissionsPage stores={stores} /></div>}

          {currentView === 'settings' && (
            userRole === 'admin' ? (
              <AdminSettingsPage
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
        </main>
      </div>

      <CustomerEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        store={editingStore}
        onSave={handleSaveCustomer}
      />
    </div>
  );
};

export default App;