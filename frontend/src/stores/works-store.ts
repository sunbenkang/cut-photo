import { create } from 'zustand';

interface WorksState {
  sortOrder: 'desc' | 'asc';
  toggleSort: () => void;
}

export const useWorksStore = create<WorksState>((set) => ({
  sortOrder: 'desc',
  toggleSort: () => set((s) => ({ sortOrder: s.sortOrder === 'desc' ? 'asc' : 'desc' })),
}));
