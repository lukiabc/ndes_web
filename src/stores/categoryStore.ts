import { defineStore } from 'pinia';

/**
 * 分类管理 store
 * 用于管理当前选中的父分类 ID
 */
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
