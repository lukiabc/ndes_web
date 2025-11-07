<template>
    <div>
        <div class="header">
            <div class="container">
                <img
                    src="@/assets/images/image.jpg"
                    alt="中国国防教育网"
                    class="header-image"
                />
                <div class="search-overlay">
                    <input
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
                                :to="item.category_id===0?'/':'/category/'+item.category_id"
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
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { getCategoryListAPI } from '@/api/category';
import { buildTree } from '@/utils/treeUtils';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';

interface Category {
    category_id: number;
    parent_id: number | null;
    category_name: string;
    sort_order: number;
    children?: Category[];
}

// 响应式数据
const hoveredId = ref<number | null>(null); // 控制 hover 显示下拉
const selectedId = ref<number | null>(null); // 控制点击激活状态

const categories = ref<Category[]>([]);
const treeData = ref<Category[]>([]);

const route = useRoute();

// 是否激活（用于背景色）
const isActive = (id: number): boolean => {
    return id === selectedId.value;
};

// 是否显示下拉菜单
const isDropdownVisible = (id: number): boolean => {
    return hoveredId.value === id;
};

// 搜索处理
const handleSearch = () => {
    console.log('执行搜索');
    // 可跳转或调用 API
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
    if (selectedId.value === item.category_id) {
        selectedId.value = null;
    } else {
        selectedId.value = item.category_id;
    }
};

// 点击页面其他地方关闭激活状态
const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    // 如果点击不在导航区域内部，则关闭所有状态
    if (!target.closest('.nav-box')) {
        selectedId.value = null;
        hoveredId.value = null;
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
            console.log(treeData.value);

            // 默认选中首页
            if (route.path === '/') {
                selectedId.value = homeItem.category_id; // 设置为首页的 ID
            }
        }
    } catch (error) {
        console.error('获取分类失败:', error);
    }

    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    // 移除事件监听
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss" scoped>
@use '@/style/element-variables.scss' as *;

.header {
    padding: 0;
    font-family: Arial, sans-serif;
}

.container {
    position: relative;
    width: 100%;
    height: 150px;
}

.header-image {
    display: block;
    width: 100%;
    height: 150px;
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
    width: 1000px;
    margin: 0 auto;
    color: white;
    overflow: visible;
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
    background-color: $primary-light-7;
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
    color: #e6f7ff;
    text-decoration: underline;
}
</style>
