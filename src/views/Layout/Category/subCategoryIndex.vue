<template>
    <div class="sub-category-index">
        <div class="left-nav">
            <div
                class="parent-category"
                :class="{ active: currentView === 'parent' }"
                @click="handleParentClick"
            >
                {{ parentTitle }}
            </div>
            <ul class="child-categories">
                <li
                    v-for="(item, index) in childCategories"
                    :key="item.category_id || index"
                    class="child-item"
                    :class="{
                        active:
                            currentView === 'child' &&
                            currentId === item.category_id,
                    }"
                    @click="handleChildClick(item)"
                >
                    {{ item.category_name }}
                </li>
            </ul>
        </div>

        <div class="right-content" v-if="articleList.length > 0">
            <ul class="article-list">
                <li
                    v-for="item in articleList"
                    :key="item.article_id"
                    class="article-item"
                >
                    <router-link
                        :to="`/article/${item.article_id}`"
                        class="article-link"
                    >
                        <span class="article-title">{{ item.title }}</span>
                    </router-link>
                    <span class="article-date">
                        [{{ formatDate(item.publish_date) }}]
                    </span>
                </li>
            </ul>

            <el-pagination
                class="pagination"
                background
                layout="total, prev, pager, next, sizes, jumper"
                :total="total"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                size="small"
                :page-sizes="[10, 20, 30, 40, 50]"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>

        <div class="right-content" v-else>
            <div class="no-content">暂无文章</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {
    getArticlesByCategoryAPI,
    getArticlesByParentCategoryAPI,
} from '@/api/article';
import { getCategoryChildrenAPI, getParentCategoryAPI } from '@/api/category';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useCategoryStore } from '@/stores/categoryStore';

const route = useRoute();

const categoryStore = useCategoryStore();

const childCategories = ref<any[]>([]);
const articleList = ref<any[]>([]);
const parentId = ref<number>(0);
const parentTitle = ref<string>('');

// 当前视图类型
const currentView = ref<'parent' | 'child'>('parent');
const currentId = ref<number | null>(null); // 当前选中的子分类 ID

// 分页
const total = ref<number>(0);
const currentPage = ref<number>(1);
const pageSize = ref<number>(10);

// 工具函数：格式化日期
const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

// 解析路由参数中的分类 ID
const parseRouteId = (): number | null => {
    const id = route.params.id;
    const numId = id ? (Array.isArray(id) ? Number(id[0]) : Number(id)) : NaN;
    return isNaN(numId) ? null : numId;
};

// 加载分类结构
const loadCategoryStructure = async (id: number) => {
    try {
        const parentRes = await getParentCategoryAPI(id);
        if (parentRes.data?.data === null) {
            parentId.value = id;
        } else {
            const parentData = parentRes.data.data;
            parentId.value = parentData.category_id;
            parentTitle.value = parentData.category_name;
        }

        // 获取该父分类下的所有子分类
        const childrenRes = await getCategoryChildrenAPI(parentId.value);
        childCategories.value = Array.isArray(childrenRes.data?.data)
            ? childrenRes.data.data
            : [];
    } catch (error) {
        console.error('加载分类结构失败:', error);
        childCategories.value = [];
    }
};

// 加载父分类文章
const loadParentArticles = async () => {
    if (parentId.value <= 0) return;

    try {
        const res = await getArticlesByParentCategoryAPI(
            parentId.value,
            currentPage.value,
            pageSize.value
        );
        const data = res.data;
        const list = Array.isArray(data.list) ? data.list : [];
        articleList.value = list.filter(
            (item: any) => item.status === '已发布'
        );
        total.value = typeof data.total === 'number' ? data.total : list.length;
    } catch (error) {
        console.error('加载父分类文章失败:', error);
        articleList.value = [];
        total.value = 0;
    }
};

// 加载子分类文章
const loadChildArticles = async () => {
    if (currentId.value === null) return;

    try {
        const res = await getArticlesByCategoryAPI(
            currentId.value,
            currentPage.value,
            pageSize.value
        );
        const data = res.data;
        const list = Array.isArray(data.list) ? data.list : [];
        articleList.value = list.filter(
            (item: any) => item.status === '已发布'
        );
        total.value = typeof data.total === 'number' ? data.total : list.length;
    } catch (error) {
        console.error('加载子分类文章失败:', error);
        articleList.value = [];
        total.value = 0;
    }
};

// 点击父分类
const handleParentClick = () => {
    currentView.value = 'parent';
    currentId.value = null;
    currentPage.value = 1;
    loadParentArticles();
};

// 点击子分类
const handleChildClick = (item: any) => {
    currentView.value = 'child';
    currentId.value = item.category_id;
    currentPage.value = 1;
    loadChildArticles();
};

// 分页事件
const handleSizeChange = (val: number) => {
    pageSize.value = val;
    if (currentView.value === 'parent') {
        loadParentArticles();
    } else {
        loadChildArticles();
    }
};

const handleCurrentChange = (val: number) => {
    currentPage.value = val;
    if (currentView.value === 'parent') {
        loadParentArticles();
    } else {
        loadChildArticles();
    }
};

// 初始化逻辑
const initialize = async () => {
    const id = parseRouteId();
    if (id === null) {
        articleList.value = [];
        return;
    }

    await loadCategoryStructure(id);

    // 判断传入的 id 是父分类还是子分类
    const isChild = childCategories.value.some(
        (child) => child.category_id === id
    );

    if (isChild) {
        currentView.value = 'child';
        currentId.value = id;
        loadChildArticles();
        // 👇 设置全局激活的父分类 ID
        categoryStore.setActiveParentId(parentId.value);
    } else {
        currentView.value = 'parent';
        currentId.value = null;
        loadParentArticles();
        categoryStore.setActiveParentId(parentId.value); // 父分类自身就是父
    }
};

// 监听路由变化
watch(
    () => route.params.id,
    () => {
        initialize();
    },
    { immediate: true }
);
</script>

<style lang="scss" scoped>
@use '@/style/element-variables.scss' as *;
@use 'sass:color';

.sub-category-index {
    display: flex;
    width: 1200px;
    min-height: 500px;
    margin: 20px auto;
    align-items: stretch;
}

.left-nav {
    flex: 1;
    max-width: calc(1200px * (1 / 4));
    box-sizing: border-box;

    .parent-category {
        background-color: $primary-base;
        color: white;
        padding: 15px;
        text-align: center;
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 1px;
        cursor: pointer; /* 可点击 */
        user-select: none;
        transition: background-color 0.2s;
    }

    .parent-category.active {
        background-color: color.adjust($primary-base, $lightness: -10%);
    }

    ul.child-categories {
        list-style: none;
        padding: 0;
        margin: 0;
        background-color: $primary-light-9;
        border-top: 1px solid #ddd;
    }

    .child-item {
        padding: 15px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        border-bottom: 1px solid #ddd;
        color: #333;
        font-size: 14px;
    }

    .child-item:hover {
        background-color: $primary-light-5;
    }

    .child-item.active {
        background-color: $primary-light-3;
        color: white;
        font-weight: bold;
    }
}

.right-content {
    flex: 3;
    max-width: calc(1200px * (3 / 4));
    box-sizing: border-box;
    padding: 20px;
    margin-left: 10px;
    background-color: white;

    .no-content {
        text-align: center;
        color: #999;
        padding: 40px 0;
    }

    ul.article-list {
        list-style: none;
        border-bottom: 1px dashed #e0e0e0;
        padding: 0;
        margin: 0;

        li.article-item {
            position: relative;
            padding-left: 20px;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;

            &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 6px;
                height: 6px;
                background-color: red;
                border-radius: 50%;
            }

            &:hover .article-title {
                color: $primary-base;
            }

            .article-title {
                flex: 1;
                color: #333;
                font-size: 16px;
            }

            .article-date {
                color: #666;
                font-size: 14px;
                margin-left: 10px;
                white-space: nowrap;
            }
        }
    }

    .article-link {
        text-decoration: none;
        color: inherit;
        display: block;
        width: 100%;
    }

    .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: center;
    }
}
</style>
