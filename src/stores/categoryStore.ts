import { defineStore } from 'pinia';

export const useCategoryStore = defineStore('category', {
    state: () => ({
        activeParentId: null as number | null,
    }),
    actions: {
        setActiveParentId(id: number | null) {
            this.activeParentId = id;
        },
    },
});
