
import { Store, Mode, StoreFormData, Customer, Visit } from '../types.ts';
import { supabase, uploadImageToStorage } from './supabase.ts';

const LOCAL_STORAGE_KEY = 'store-management-cache';

const api = {
  getStoredStores: (): Store[] => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  addToLocalCache(newStore: Store) {
    const current = this.getStoredStores();
    const updated = [newStore, ...current];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  },

  async syncStores(mode: Mode): Promise<Store[]> {
    // تم زيادة النطاق (range) لجلب حتى 10,000 سجل لضمان عدم ضياع أي بيانات
    const { data, error } = await supabase
      .from('visits')
      .select(`
        *,
        customers (*)
      `)
      .order('created_at', { ascending: false })
      .range(0, 10000); 

    if (error) throw new Error(error.message || "Erreur de synchronisation avec Supabase");

    const mappedData = (data || []).map(v => {
        if (!v.customers) return null;
        const c = v.customers;
        return {
            ...c,
            id: c.id,
            ID: v.id.toString(),
            Magazin: c.name,
            'Le Gérant': c.manager,
            Localisation: c.location,
            Ville: c.city,
            Région: c.region,
            Adresse: c.address,
            GSM1: c.gsm1,
            GSM2: c.gsm2,
            Phone: c.phone,
            Email: c.email,
            Gamme: c.gamme,
            USER: v.user_email,
            Date: new Date(v.created_at).toLocaleDateString('fr-FR'),
            'Date Heure': v.created_at,
            'Action Client': v.action,
            'Rendez-Vous': v.appointment_date,
            Note: v.note,
            'Contacté': v.contacted,
            'Discuté': v.discussed,
            Prix: v.price,
            Quantité: v.quantity,
            Image: v.image,
            is_blocked: c.is_blocked
        };
    }).filter(Boolean) as Store[];

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mappedData));
    return mappedData;
  },

  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
        .from('customers')
        .insert([{
            name: customerData.name,
            manager: customerData.manager,
            city: customerData.city,
            region: customerData.region,
            address: customerData.address,
            gsm1: customerData.gsm1,
            gsm2: customerData.gsm2,
            phone: customerData.phone,
            email: customerData.email,
            gamme: customerData.gamme || 'Moyenne',
            location: customerData.location,
            user_email: customerData.user_email,
            is_blocked: customerData.is_blocked || false
        }])
        .select()
        .single();

    if (error) throw new Error(`Erreur lors de la création du client: ${error.message}`);
    return data as Customer;
  },

  async bulkImportCustomers(customers: any[]): Promise<number> {
    if (!Array.isArray(customers)) throw new Error("Les données doivent être un tableau JSON.");
    
    const cleaned = customers.map(c => ({
      name: String(c.name || c.Magazin || c.shop || '').trim(),
      manager: String(c.manager || c['Le Gérant'] || c.gerant || '').trim(),
      city: String(c.city || c.Ville || c.ville || '').trim(),
      region: String(c.region || c.Région || c.quartier || '').trim(),
      address: String(c.address || c.Adresse || '').trim(),
      gsm1: String(c.gsm1 || c.GSM1 || c.gsm || '').trim(),
      gsm2: String(c.gsm2 || c.GSM2 || '').trim(),
      phone: String(c.phone || c.Phone || '').trim(),
      email: String(c.email || c.Email || '').trim(),
      gamme: String(c.gamme || c.Gamme || 'Moyenne'),
      location: String(c.location || c.Localisation || ''),
      user_email: String(c.user_email || c.USER || ''),
      is_blocked: !!(c.is_blocked === true || c.is_blocked === 'Yes')
    })).filter(c => c.name && c.city);

    if (cleaned.length === 0) throw new Error("Aucune donnée valide trouvée dans le fichier JSON.");

    const { error } = await supabase
      .from('customers')
      .upsert(cleaned, { onConflict: 'name,city' });
    
    if (error) {
        if (error.message.includes('unique or exclusion constraint')) {
            throw new Error("ERREUR CRITIQUE : La contrainte UNIQUE (name, city) n'existe pas dans Supabase. Veuillez exécuter le code SQL de configuration avant d'importer.");
        }
        throw new Error(`Erreur Upsert Customers: ${error.message}`);
    }
    
    return cleaned.length;
  },

  async bulkImportVisits(visits: any[]): Promise<number> {
    if (!Array.isArray(visits)) throw new Error("Les données doivent être un tableau JSON.");

    const cleaned = visits.map(v => ({
      customer_id: v.customer_id,
      user_email: String(v.user_email || v.USER || 'admin@apollo.com'),
      action: String(v.action || v['Action Client'] || 'Visite'),
      appointment_date: v.appointment_date || v['Rendez-Vous'] || null,
      note: String(v.note || ''),
      contacted: String(v.contacted || v['Contacté'] || ''),
      discussed: String(v.discussed || v['Discuté'] || ''),
      price: Number(v.price || v.Prix) || 0,
      quantity: Number(v.quantity || v.Quantité) || 0,
      image: v.image || v.Image || null,
      created_at: v.created_at || v['Date Heure'] || new Date().toISOString()
    })).filter(v => v.customer_id);

    if (cleaned.length === 0) throw new Error("Aucune visite liée à un customer_id n'a été trouvée.");

    const { error } = await supabase.from('visits').insert(cleaned);
    if (error) throw new Error(`Erreur Insert Visits: ${error.message}`);
    return cleaned.length;
  },

  async exportCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase.from('customers').select('*').order('name');
    if (error) throw new Error(`Erreur Export Customers: ${error.message}`);
    return data || [];
  },

  async exportVisits(): Promise<Visit[]> {
    const { data, error } = await supabase.from('visits').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(`Erreur Export Visits: ${error.message}`);
    return data || [];
  },

  async addStore(mode: Mode, formData: StoreFormData, _url?: string, userEmail?: string): Promise<Store> {
    let customerId = formData.id;
    let imageUrl = formData.Image;

    if (imageUrl && imageUrl.startsWith('data:image')) {
        try {
            imageUrl = await uploadImageToStorage(imageUrl);
        } catch (e) {
            console.error("Image upload failed", e);
        }
    }

    if (!customerId) {
        const newCust = await this.createCustomer({
            name: formData.Magazin,
            manager: formData['Le Gérant'],
            location: formData.Localisation,
            city: formData.Ville,
            region: formData.Région,
            address: formData.Adresse,
            gsm1: formData.GSM1,
            gsm2: formData.GSM2,
            phone: formData.Phone,
            email: formData.Email,
            gamme: formData.Gamme || 'Moyenne',
            user_email: userEmail || formData.USER
        });
        customerId = newCust.id;
    }

    const { data: newVisit, error: visitErr } = await supabase
        .from('visits')
        .insert([{
            customer_id: customerId,
            user_email: userEmail || formData.USER || 'vendeur@apollo.com',
            action: formData['Action Client'] || 'Visite',
            appointment_date: formData['Rendez-Vous'] || null,
            note: formData.Note || '',
            contacted: formData['Contacté'] || '',
            discussed: formData['Discuté'] || '',
            price: Number(formData.Prix) || 0,
            quantity: Number(formData.Quantité) || 0,
            image: imageUrl
        }])
        .select()
        .single();

    if (visitErr) throw new Error(`Erreur lors de l'enregistrement de la visite: ${visitErr.message}`);

    return { ...formData, id: customerId, ID: newVisit.id.toString(), Image: imageUrl } as Store;
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
    const { error } = await supabase
        .from('customers')
        .update(data)
        .eq('id', id);
    if (error) throw new Error(`Erreur lors de la mise à jour du client: ${error.message}`);
  },

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
    if (error) throw new Error(`Erreur lors de la suppression du client: ${error.message}`);
  }
};

export default api;
