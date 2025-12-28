
import React, { useState, useEffect } from 'react';
import { Store } from '../types.ts';
import { GoogleGenAI } from "@google/genai";
import SparklesIcon from './icons/SparklesIcon.tsx';
import XMarkIcon from './icons/XMarkIcon.tsx';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import ClockIcon from './icons/ClockIcon.tsx';
import TagIcon from './icons/TagIcon.tsx';

interface LeadPrioritizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    stores: Store[];
}

const LeadPrioritizationModal: React.FC<LeadPrioritizationModalProps> = ({ isOpen, onClose, stores }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string>('');

    const generatePrioritization = async () => {
        setIsLoading(true);
        setResult('');

        try {
            // Simplify data for the model
            const leadSummary = stores.slice(0, 50).map(s => ({
                name: s.Magazin,
                city: s.Ville,
                gamme: s.Gamme,
                lastVisit: s.Date,
                action: s['Action Client'],
                note: s.Note
            }));

            const prompt = `
                Analysez cette liste de prospects pour un commercial itinérant au Maroc. 
                Identifiez les 5 priorités absolues basées sur : 
                1. Gamme (Haute > Moyenne). 
                2. Récence (plus c'est vieux, plus c'est urgent si c'est un bon client). 
                3. Proximité géographique (regroupez par ville).
                
                Données : ${JSON.stringify(leadSummary)}
                
                Répondez au format HTML propre (Tailwind CSS possible) avec :
                - Une section "Action Immédiate" (Top 3 prospects).
                - Une section "Opportunités Stratégiques" (Groupements par ville).
                - Une section "Conseils IA" pour augmenter le taux de conversion.
            `;

            // FIX: Initialized GoogleGenAI right before the API call as per the guidelines.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    temperature: 0.7,
                }
            });

            // FIX: Accessed the text content from the model's response using the `.text` property.
            setResult(response.text || 'Erreur lors de la génération.');
        } catch (error) {
            console.error(error);
            setResult('Désolé, une erreur est survenue lors de l\'analyse par l\'IA.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            generatePrioritization();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-indigo-600 text-white">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-6 h-6 text-yellow-300" />
                        <div>
                            <h3 className="text-xl font-black">Priorisation Stratégique IA</h3>
                            <p className="text-[10px] uppercase font-bold text-indigo-200">Propulsé par Gemini 3 Flash</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <SpinnerIcon className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-200">L'IA analyse vos leads...</p>
                            <p className="text-sm text-slate-400 mt-2">Optimisation des tournées et évaluation du potentiel</p>
                        </div>
                    ) : (
                        <div className="prose prose-indigo dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result }} />
                    )}
                </div>

                <footer className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all">
                        Terminé
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default LeadPrioritizationModal;
