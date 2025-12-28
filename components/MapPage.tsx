
import React, { useState, useMemo } from 'react';
import { Store } from '../types.ts';
import SearchIcon from './icons/SearchIcon.tsx';
import LocationMarkerIcon from './icons/LocationMarkerIcon.tsx';
import PhoneCallIcon from './icons/PhoneCallIcon.tsx';

// Coordinates for major Moroccan cities to simulate "Zoom" functionality
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  "Casablanca": { lat: 33.5731, lon: -7.5898 },
  "Rabat": { lat: 34.0209, lon: -6.8416 },
  "Marrakech": { lat: 31.6295, lon: -7.9811 },
  "Tanger": { lat: 35.7595, lon: -5.8340 },
  "Agadir": { lat: 30.4278, lon: -9.5981 },
  "Fès": { lat: 34.0181, lon: -5.0078 },
  "Meknès": { lat: 33.8935, lon: -5.5547 },
  "Oujda": { lat: 34.6814, lon: -1.9076 },
  "Kenitra": { lat: 34.2610, lon: -6.5802 },
  "Tetouan": { lat: 35.5785, lon: -5.3684 },
  "Safi": { lat: 32.3254, lon: -9.255 },
  "Mohammedia": { lat: 33.6874, lon: -7.3829 },
  "Beni Mellal": { lat: 32.3394, lon: -6.3608 },
  "Nador": { lat: 35.1681, lon: -2.9335 },
  "El Jadida": { lat: 33.2316, lon: -8.5007 },
  "Laayoune": { lat: 27.1253, lon: -13.1625 },
  "Dakhla": { lat: 23.6848, lon: -15.9570 },
  "Errachidia": { lat: 31.9323, lon: -4.4235 },
  "Ouarzazate": { lat: 30.9189, lon: -6.8934 },
  "Essaouira": { lat: 31.5085, lon: -9.7595 },
  "Salé": { lat: 34.0531, lon: -6.7985 },
  "Temara": { lat: 33.9171, lon: -6.9238 },
  "Khouribga": { lat: 32.8807, lon: -6.9063 },
  "Settat": { lat: 33.0010, lon: -7.6166 }
};

const DEFAULT_BBOX = "-17.0,21.0,-1.0,36.0"; // Morocco View

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

const AdjustmentsHorizontalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
    </svg>
);

interface MapPageProps {
  stores: Store[];
}

const MapPage: React.FC<MapPageProps> = ({ stores }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('Tout le Maroc');
  const [mapBbox, setMapBbox] = useState(DEFAULT_BBOX);
  const [markerPos, setMarkerPos] = useState<{lat: number, lon: number} | null>(null);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const matchesSearch = 
        store.Magazin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (store.Ville && store.Ville.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCity = selectedCity === 'Tout le Maroc' || store.Ville === selectedCity;

      return matchesSearch && matchesCity;
    });
  }, [stores, searchQuery, selectedCity]);

  const cities = useMemo(() => {
    const citySet = new Set(stores.map(s => s.Ville).filter(Boolean));
    return ['Tout le Maroc', ...Array.from(citySet).sort()];
  }, [stores]);

  const getStatusColor = (status?: string) => {
      switch(status) {
          case 'Gagné': return 'bg-emerald-100 text-emerald-700';
          case 'Prospect': return 'bg-blue-100 text-blue-700';
          case 'Perdu': return 'bg-red-100 text-red-700';
          default: return 'bg-slate-100 text-slate-700';
      }
  };

  const getDerivedStatus = (store: Store) => {
      if (store['Action Client'] === 'Acheter') return 'Gagné';
      if (store['Action Client'] === 'Revisiter') return 'Prospect';
      return 'Nouveau';
  };

  // Function to calculate a bounding box around a center point to simulate zoom
  const updateMapToCity = (cityName: string) => {
      // Normalize city name matching
      const foundCityKey = Object.keys(CITY_COORDS).find(k => k.toLowerCase() === cityName.toLowerCase());
      
      if (foundCityKey) {
          const { lat, lon } = CITY_COORDS[foundCityKey];
          // Create a small window around the city coordinates (approx 0.1 degree is roughly city level zoom)
          const delta = 0.08; 
          const minLon = lon - delta;
          const maxLon = lon + delta;
          const minLat = lat - delta;
          const maxLat = lat + delta;
          
          setMapBbox(`${minLon},${minLat},${maxLon},${maxLat}`);
      } else if (cityName === 'Tout le Maroc') {
          setMapBbox(DEFAULT_BBOX);
      }
  };

  const handleCityFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCity = e.target.value;
      setSelectedCity(newCity);
      updateMapToCity(newCity);
      setMarkerPos(null);
      setActiveStoreId(null);
  };

  const handleStoreClick = (store: Store) => {
      setActiveStoreId(store.ID);
      
      // 1. Try Precise Location (GPS)
      if (store.Localisation) {
          const parts = store.Localisation.split(',').map(s => parseFloat(s.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              const lat = parts[0];
              const lon = parts[1];
              
              // Very tight zoom for specific location (approx 0.005 deg)
              const delta = 0.005; 
              setMapBbox(`${lon - delta},${lat - delta},${lon + delta},${lat + delta}`);
              setMarkerPos({ lat, lon });
              return;
          }
      }

      // 2. Fallback to City Center
      if (store.Ville) {
          const foundCityKey = Object.keys(CITY_COORDS).find(k => k.toLowerCase() === store.Ville.toLowerCase());
          if (foundCityKey) {
              const coords = CITY_COORDS[foundCityKey];
              updateMapToCity(store.Ville);
              // Set marker to city center if specific GPS is missing, indicating general location
              setMarkerPos(coords);
          } else {
              // Just zoom to city without marker if coords not in our dictionary
              updateMapToCity(store.Ville);
              setMarkerPos(null);
          }
      } else {
          setMarkerPos(null);
      }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar List */}
      <div className="w-96 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0 z-10 shadow-xl">
        
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 z-20">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Carte des Leads</h2>
            
            <div className="space-y-3">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg leading-5 bg-slate-50 dark:bg-slate-700 placeholder-slate-500 focus:outline-none focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] sm:text-sm dark:text-white"
                        placeholder="Rechercher un prospect..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-2">
                     <select 
                        value={selectedCity}
                        onChange={handleCityFilterChange}
                        className="block w-full py-2 px-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] sm:text-sm dark:text-white"
                     >
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                     </select>
                     <button 
                        onClick={() => { setSelectedCity('Tout le Maroc'); setMapBbox(DEFAULT_BBOX); setMarkerPos(null); }}
                        className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600"
                        title="Réinitialiser la vue"
                     >
                         <AdjustmentsHorizontalIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                     </button>
                </div>
            </div>
            
            <div className="mt-4 flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>{filteredStores.length} résultats trouvés</span>
                <span className="text-[var(--accent-color)] cursor-pointer hover:underline">Voir tout</span>
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50 dark:bg-slate-900/50">
            {filteredStores.map(store => {
                const status = getDerivedStatus(store);
                const isActive = activeStoreId === store.ID;
                
                return (
                <div 
                    key={store.ID} 
                    onClick={() => handleStoreClick(store)}
                    className={`p-3 rounded-lg border shadow-sm transition-all cursor-pointer group ${
                        isActive 
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 dark:bg-blue-900/20 dark:border-blue-400' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className={`font-semibold transition-colors ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white group-hover:text-[var(--accent-color)]'}`}>
                                {store.Magazin}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                <LocationMarkerIcon className="w-3 h-3" /> {store.Ville}
                            </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(status)}`}>
                            {status}
                        </span>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-2">
                         {/* FIX: Replaced store.Gérant with store['Le Gérant'] to match the Store interface. */}
                         <p className="text-xs text-slate-400">{store['Le Gérant']}</p>
                         <div className="flex gap-2">
                             {/* FIX: Replaced store.GSM with store.GSM1 to match the Store interface. */}
                             {store.GSM1 && (
                                <a href={`tel:${store.GSM1}`} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors" onClick={(e) => e.stopPropagation()}>
                                    <PhoneCallIcon className="w-4 h-4" />
                                </a>
                             )}
                             <button className="p-1.5 text-slate-400 hover:text-[var(--accent-color)] hover:bg-blue-50 rounded-full transition-colors">
                                 <ChevronRightIcon className="w-4 h-4" />
                             </button>
                         </div>
                    </div>
                </div>
            )})}
            
            {filteredStores.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Aucun résultat trouvé</p>
                </div>
            )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-slate-200 dark:bg-slate-900">
         <div className="absolute inset-0 z-0">
            {/* OpenStreetMap Embed centered on Morocco */}
            <iframe 
                key={`${mapBbox}-${markerPos ? 'marker' : 'nomarker'}`} // Force re-render on marker change
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'grayscale(20%) contrast(1.1)' }}
                loading="lazy" 
                allowFullScreen 
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapBbox}&layer=mapnik${markerPos ? `&marker=${markerPos.lat},${markerPos.lon}` : ''}`}
                title="Carte du Maroc"
            ></iframe>
         </div>
         
         {/* Floating Map Controls (Simulated) */}
         <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
             <button className="p-2 bg-white dark:bg-slate-800 shadow-md rounded-lg text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 font-bold">
                 +
             </button>
             <button className="p-2 bg-white dark:bg-slate-800 shadow-md rounded-lg text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 font-bold">
                 -
             </button>
         </div>

         {/* Legend / Info Overlay */}
         <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-600 max-w-xs z-10">
             <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">Légende</h4>
             <div className="space-y-2 text-xs">
                 <div className="flex items-center gap-2">
                     <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 shadow-sm"></span>
                     <span className="text-slate-600 dark:text-slate-300">Clients Gagnés</span>
                 </div>
                 <div className="flex items-center gap-2">
                     <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800 shadow-sm"></span>
                     <span className="text-slate-600 dark:text-slate-300">Prospects en cours</span>
                 </div>
                 <div className="flex items-center gap-2">
                     <span className="w-3 h-3 rounded-full bg-slate-400 border-2 border-white dark:border-slate-800 shadow-sm"></span>
                     <span className="text-slate-600 dark:text-slate-300">Nouveaux Leads</span>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default MapPage;
