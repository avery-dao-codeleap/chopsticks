import { create } from 'zustand';

interface LanguageState {
  language: 'en' | 'vi';
  setLanguage: (lang: 'en' | 'vi') => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en',
  setLanguage: (language) => set({ language }),
}));
