import {create} from 'zustand';


export const useTabs = create((set) => ({
    tab: "",
    setTab: (tab = "") => set({tab}),
}))