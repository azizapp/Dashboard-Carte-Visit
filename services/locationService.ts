
import { supabase } from './supabase.ts';
import { moroccanLocations as staticLocations } from './locationData.ts';

export interface LocationEntry {
    id?: number;
    ville: string;
    region: string;
}

const locationService = {
    async getAllLocations(): Promise<LocationEntry[]> {
        try {
            const { data, error } = await supabase
                .from('moroccan_locations')
                .select('*')
                .order('ville', { ascending: true });

            if (error) throw error;

            // دمج البيانات الثابتة مع بيانات قاعدة البيانات لتجنب التكرار
            const dbLocations = (data || []).map(l => ({ Ville: l.ville, Région: l.region }));
            const combined = [...staticLocations];
            
            dbLocations.forEach(dbLoc => {
                const exists = combined.some(
                    stLoc => stLoc.Ville.toLowerCase() === dbLoc.Ville.toLowerCase() && 
                             stLoc.Région.toLowerCase() === dbLoc.Région.toLowerCase()
                );
                if (!exists) {
                    combined.push(dbLoc);
                }
            });

            return combined.map((l, index) => ({
                id: index,
                ville: l.Ville,
                region: l.Région
            }));
        } catch (e) {
            console.error("Error fetching locations:", e);
            return staticLocations.map((l, index) => ({
                id: index,
                ville: l.Ville,
                region: l.Région
            }));
        }
    },

    async addLocation(ville: string, region: string): Promise<void> {
        const { error } = await supabase
            .from('moroccan_locations')
            .insert([{ ville, region }]);

        if (error) throw error;
    },

    async deleteLocation(id: number): Promise<void> {
        // حذف فقط من قاعدة البيانات
        const { error } = await supabase
            .from('moroccan_locations')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

export default locationService;
