<template>
    <div>
        <div class="header">
            <div class="header-container">
                <img
                    src="@/assets/images/image.jpg"
                    alt="中国国防教育网"
                    class="header-image"
                />
                <div class="search-overlay">
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="标题/内容关键词"
                        class="search-input"
                        @keyup.enter="handleSearch"
                    />
                    <button class="search-btn" @click="handleSearch">
                        搜索
                    </button>
                </div>
            </div>

            <div class="nav-container">
                <nav class="nav-box">
                    <ul class="nav-menu">
                        <!-- 父菜单 -->
                        <li
                            v-for="item in treeData"
                            :key="item.category_id"
                            class="nav-item"
                            :class="{ active: isActive(item.category_id) }"
                            @mouseenter="showDropdown(item.category_id)"
                            @mouseleave="hideDropdown"
                        >
                            <router-link
                                :to="
                                    item.category_id === 0
                                        ? '/'
                                        : '/category/' + item.category_id
                                "
                                class="nav-link"
                                @click="handleCategoryClick(item)"
                            >
                                {{ item.category_name }}
                            </router-link>

                            <!-- 子菜单 -->
                            <ul
                                v-if="item.children && item.children.length > 0"
                                class="dropdown-menu"
                                :class="{
                                    show: isDropdownVisible(item.category_id),
                                }"
                                @mouseenter.stop="keepOpen(item.category_id)"
                                @mouseleave="hideDropdown"
                            >
                                <li
                                    v-for="child in item.children"
                                    :key="child.category_id"
                                    class="dropdown-item"
                                >
                                    <router-link
                                        :to="`/category/sub/${child.category_id}`"
                                        class="dropdown-link"
                                    >
                                        {{ child.category_name }}
                                    </router-link>
                                </li>
                            </ul>
                        </li>
                        <li
                            id="xmedia"
                            class="nav-item"
                            :class="{ active: isActive(-1) }"
                            @mouseenter="showDropdown(-1)"
                            @mouseleave="hideDropdown"
                        >
                            <a href="javascript:;" class="nav-link">军队媒体</a>
                            <ul
                                class="dropdown-menu"
                                :class="{ show: isDropdownVisible(-1) }"
                                @mouseenter.stop="keepOpen(-1)"
                                @mouseleave="hideDropdown"
                            >
                                <li class="dropdown-item">
                                    <a
                                        href="http://www.81.cn"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="dropdown-link"
                                        >中国军网</a
                                    >
                                </li>
                                <li class="dropdown-item">
                                    <a
                                        href="http://81rc.81.cn"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="dropdown-link"
                                        >军队人才网</a
                                    >
                                </li>
                                <li class="dropdown-item">
                                    <a
                                        href="http://www.81.cn/szb_223187/szblb/index.html?paperNumber=01&amp;paperName=jfjb&amp;paperDate=2025-11-07"
                                        id="jfjbMenu"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="dropdown-link"
                                        >解放军报</a
                                    >
                                </li>
                                <li class="dropdown-item">
                                    <a
                                        href="http://www.81.cn/szb_223187/gfbszblb/index.html?paperNumber=01&amp;paperName=zggfb&amp;paperDate=2025-11-07"
                                        id="gfbMenu"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="dropdown-link"
                                        >中国国防报</a
                                    >
                                </li>
                                <li class="dropdown-item">
                                    <a
                                        href="http://www.81.cn/rmjz_203219/zgmb/index.html"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="dropdown-link"
                                        >中国民兵</a
                                    >
                                </li>
                                <li class="dropdown-item">
                                    <a
                                        href="http://www.plapic.com.cn"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="dropdown-link"
                                        >解放军画报</a
                                    >
                                </li>
                                <li class="dropdown-item">
                                    <a
                                        href="http://www.81.cn/rmjz_203219/gfjy_203685/index.html"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="dropdown-link"
                                        >国防教育</a
                                    >
                                </li>
                            </ul>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { getCategoryListAPI } from '@/api/category';
import { buildTree } from '@/utils/treeUtils';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCategoryStore } from '@/stores/categoryStore';

const categoryStore = useCategoryStore();

interface Category {
    category_id: number;
    parent_id: number | null;
    category_name: string;
    sort_order: number;
    children?: Category[];
}

// 响应式数据
const hoveredId = ref<number | null>(null); // 控制 hover 显示下拉、

// 搜索查询
const searchQuery = ref<string>('');

const categories = ref<Category[]>([]);
const treeData = ref<Category[]>([]);

const route = useRoute();
const router = useRouter();

// 是否激活（用于背景色）
const isActive = (id: number): boolean => {
    return id === categoryStore.activeParentId;
};

// 是否显示下拉菜单
const isDropdownVisible = (id: number): boolean => {
    return hoveredId.value === id;
};

// 全文搜索
const handleSearch = () => {
    const keyword = searchQuery.value.trim();
    console.log(keyword, '搜索关键词');
    if (!keyword) {
        ElMessage.error('请输入搜索关键词');
        return;
    }

    router.push({
        name: 'search',
        query: { keyword },
    });
};

// 鼠标进入
const showDropdown = (id: number | null) => {
    hoveredId.value = id;
    if (id !== null) {
        const item = treeData.value.find((cat) => cat.category_id === id);
    }
};

// 鼠标离开
const hideDropdown = () => {
    hoveredId.value = null;
};

// 保持下拉菜单打开
const keepOpen = (id: number) => {
    hoveredId.value = id;
};

// 点击菜单项
const handleCategoryClick = (item: Category) => {
    if (categoryStore.activeParentId === item.category_id) {
        categoryStore.activeParentId = null;
    } else {
        categoryStore.activeParentId = item.category_id;
    }
};

const updateSelectedIdFromRoute = () => {
    const path = route.path;

    // 首页
    if (path === '/') {
        categoryStore.activeParentId = 0;
        return;
    }

    // 一级分类页面
    const categoryMatch = path.match(/^\/category\/(\d+)$/);
    if (categoryMatch) {
        const id = Number(categoryMatch[1]);
        // 只有在 treeData 顶层存在的才视为有效父分类
        if (treeData.value.some((item) => item.category_id === id)) {
            categoryStore.activeParentId = id;
        } else {
            categoryStore.activeParentId = null;
        }
        return;
    }

    // 子分类页面
    const subMatch = path.match(/^\/category\/sub\/(\d+)$/);
    if (subMatch) {
        const childId = Number(subMatch[1]);

        // 递归查找该子分类的 parent_id
        const findParentId = (nodes: Category[]): number | null => {
            for (const node of nodes) {
                if (node.children) {
                    for (const child of node.children) {
                        if (child.category_id === childId) {
                            return node.category_id; // 找到父级 ID
                        }
                    }
                    const found = findParentId(node.children);
                    if (found !== null) return found;
                }
            }
            return null;
        };

        const parentId = findParentId(treeData.value);
        if (
            parentId !== null &&
            treeData.value.some((item) => item.category_id === parentId)
        ) {
            categoryStore.activeParentId = parentId;
        } else {
            categoryStore.activeParentId = null;
        }
        return;
    }
};

onMounted(async () => {
    try {
        const res = await getCategoryListAPI();
        if (Array.isArray(res?.data)) {
            categories.value = res.data;

            const homeItem: Category = {
                category_id: 0,
                parent_id: null,
                category_name: '首页',
                sort_order: 0,
            };

            const listWithHome = [homeItem, ...res.data];
            treeData.value = buildTree(listWithHome) as Category[];

            // 默认选中首页
            if (route.path === '/') {
                categoryStore.activeParentId = homeItem.category_id; // 设置为首页的 ID
            }
        }
    } catch (error) {
        console.error('获取分类失败:', error);
    }

    updateSelectedIdFromRoute();
});

watch(
    () => route.path,
    () => {
        updateSelectedIdFromRoute();
    }
);
</script>

<style lang="scss" scoped>
@use '@/style/element-variables.scss' as *;

.header {
    padding: 0;
    font-family: Arial, sans-serif;
}

.header-container {
    position: relative;
    width: 100%;
}

.header-image {
    display: block;
    width: 100%;
    object-fit: cover;
}

.search-overlay {
    position: absolute;
    top: 60%;
    right: 20%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 10;
    padding: 6px 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.9);
}

.search-input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    outline: none;
    font-size: 14px;
    width: 200px;
}

.search-input:focus {
    border-color: $primary-base;
}

.search-btn {
    padding: 8px 16px;
    background-color: $primary-base;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.search-btn:hover {
    background-color: $primary-light-3;
}

.nav-container {
    width: 100%;
    height: 45px;
    background-color: $primary-base;
}

.nav-box {
    width: 1200px;
    margin: 0 auto;
    color: white;
}

.nav-menu {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    height: 100%;
    position: relative;
    overflow: visible;
    flex-wrap: nowrap;
    justify-content: center;
}

.nav-item {
    height: 45px;
    white-space: nowrap;
    text-align: center;
    transition: background-color 0.3s ease;
    position: relative;
    overflow: visible;
}

.nav-link {
    display: block;
    height: 45px;
    line-height: 45px;
    color: white;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    padding: 0 15px;
}

.nav-item:hover:not(.active) {
    background-color: $primary-light-3;
}

.nav-item.active {
    background-color: $primary-light-3;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    list-style: none;
    font-size: 12px;
    min-width: 100px;
    max-width: 445px;
    background-color: white;
    border: 1px solid #eee;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    overflow: hidden;
    opacity: 0;
    max-height: 0;
    padding: 0 15px;
    transition: max-height 0.5s ease, opacity 0.5s ease, padding 0.5s ease;

    &.show {
        opacity: 1;
        max-height: 700px;
        padding: 8px 15px;
    }
}

.dropdown-item {
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
}

.dropdown-item:last-child {
    border-bottom: none;
}

.dropdown-link {
    color: rgb(0, 0, 0);
    text-decoration: none;
    font-size: 14px;
    display: block;
    transition: color 0.3s ease;
}

.dropdown-link:hover {
    color: $primary-base;
    text-decoration: none;
}
</style>
