import {create} from 'zustand';

const useEventStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  event: null,
  setEvent: (event) => set({ event })
}));

export default useEventStore;