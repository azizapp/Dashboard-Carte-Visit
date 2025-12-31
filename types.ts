export enum Mode {
  Test = 'test',
  Production = 'production',
}

export interface AppSettings {
  id?: string;
  app_name: string;
  short_name: string;
  accent_color: string;
  favicon_url: string;
  icon_192_url: string;
  icon_512_url: string;
  updated_at?: string;
}

export interface UserSession {
  email: string;
  role: 'manager' | 'admin' | 'user';
}

export interface UserProfile {
  email: string;
  role: 'manager' | 'admin' | 'user';
  code?: string;
  created_at?: string;
}

export interface Customer {
  id: string;
  name: string; // Magazin
  manager: string; // Le Gérant
  city: string; // Ville
  region?: string; // Région
  address?: string; // Adresse
  gsm1: string;
  gsm2?: string;
  phone?: string;
  email?: string;
  gamme: string;
  location?: string; // Localisation
  user_email?: string; // USER
  created_at?: string; // Date + Date Heure
  is_blocked?: boolean; // خاصية الحظر
}

export interface Visit {
  id: string;
  customer_id: string;
  user_email: string; // USER
  action: string; // Action Client
  appointment_date?: string; // Rendez-Vous
  note?: string;
  contacted: string; 
  discussed: string; 
  price: number; // Prix
  quantity: number; // Quantité
  image?: string;
  created_at: string;
}

export interface Store extends Customer {
  ID: string;
  Date: string;
  'Date Heure'?: string;
  Magazin: string;
  'Le Gérant': string;
  Localisation?: string;
  Ville: string;
  Région?: string;
  Adresse?: string;
  GSM1: string;
  GSM2?: string;
  Phone?: string;
  Email?: string;
  Gamme: string;
  USER: string;
  'Action Client': string;
  'Rendez-Vous'?: string;
  Note?: string;
  'Contacté'?: string;
  'Discuté'?: string;
  Prix: number;
  Quantité: number;
  Image?: string;
}

export type StoreFormData = Partial<Store>;

export type FilterState = {
  city: string;
  gammes: string[];
  priorities: string[];
};