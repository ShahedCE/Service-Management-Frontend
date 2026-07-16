import { create } from "zustand";

interface ModalState {
  isCreateModalOpen: boolean;
  setCreateModalOpen: (open: boolean) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isCreateModalOpen: false,
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
}));
