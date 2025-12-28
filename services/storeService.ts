
import { Store, Mode, StoreFormData, Customer, Visit } from '../types.ts';
import { supabase, uploadImageToStorage } from './supabase.ts';

const LOCAL_STORAGE_KEY = 'store-management-cache';

const api = {
  getStoredStores: (): Store[] => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // تحديث الكاش المحلي يدوياً لإظهار البيانات فوراً
  addToLocalCache(newStore: Store) {
    const current = this.getStoredStores();
    const updated = [newStore, ...current];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  },

  async syncStores(mode: Mode): Promise<Store[]> {
    const { data, error } = await supabase
      .from('visits')
      .select(`
        *,
        customers (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

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
            Image: v.image
        };
    }).filter(Boolean) as Store[];

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mappedData));
    return mappedData;
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
        const { data: newCust, error: custErr } = await supabase
            .from('customers')
            .insert([{
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
            }])
            .select()
            .single();
        
        if (custErr) throw new Error(`Erreur Client: ${custErr.message}`);
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

    if (visitErr) throw new Error(`Erreur Visite: ${visitErr.message}`);

    // لا نقوم بعمل sync هنا لتوفير الوقت، التحديث تم يدوياً في الواجهة
    return { ...formData, ID: newVisit.id.toString(), Image: imageUrl } as Store;
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
    const { error } = await supabase
        .from('customers')
        .update(data)
        .eq('id', id);
    if (error) throw error;
  }
};

export default api;
