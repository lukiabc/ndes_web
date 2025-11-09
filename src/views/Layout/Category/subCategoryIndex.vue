<template>
    <div class="sub-category-index">
        <div class="left-nav">
            <div class="parent-category">{{ parentTitle }}</div>
            <ul class="child-categories">
                <li
                    v-for="(item, index) in childCategories"
                    :key="index"
                    class="child-item"
                    :class="{ active: currentId === item.category_id }"
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
                        [{{ formatDate(item.scheduled_publish_date) }}]
                    </span>
                </li>
            </ul>
        </div>
        <div class="right-content" v-else>
            <div class="no-content">暂无文章</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { getCategoryChildrenAPI, getParentCategoryAPI } from '@/api/category';
import { getArticlesByCategoryAPI } from '@/api/article';
import { useRoute } from 'vue-router';

const route = useRoute();

const childCategories = ref<any[]>([]);
const articleList = ref<any[]>([]);
const parentId = ref<number>(0);
const parentTitle = ref<string>('');

const currentId = ref<number | null>(null);

// 格式化日期
const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toISOString().split('T')[0];
};

// 获取路由id
const parseRouteId = () => {
    const id = route.params.id;
    const numId = id ? (Array.isArray(id) ? Number(id[0]) : Number(id)) : NaN;
    return isNaN(numId) ? null : numId;
};

// 获取父分类 ID + 子分类列表
const loadCategoryStructure = async (id: number) => {
    try {
        const parentRes = await getParentCategoryAPI(id);
        // 如果是顶级分类，data 可能为 null，此时 parentId 就是 id 本身
        parentTitle.value = parentRes.data.data.category_name;
        if (parentRes.data?.data === null) {
            parentId.value = id;
            console.log(parentTitle.value);
        } else {
            parentId.value = parentRes.data?.data?.category_id || 0;
        }

        const childrenRes = await getCategoryChildrenAPI(parentId.value);
        childCategories.value = childrenRes.data?.data || [];
    } catch (error) {
        console.error('加载分类结构失败:', error);
        childCategories.value = [];
    }
};

// 加载文章列表
const loadArticles = async (categoryId: number) => {
    try {
        const res = await getArticlesByCategoryAPI(categoryId, 1, 10);
        let list = res.data?.list || [];
        list = list.filter((item: any) => item.status === '已发布');
        articleList.value = list;
    } catch (error) {
        console.error('加载文章失败:', error);
        articleList.value = [];
    }
};

// 点击左侧子分类
const handleChildClick = (item: any) => {
    currentId.value = item.category_id;
    loadArticles(item.category_id);
};

// 根据路由加载数据
const initialize = async () => {
    const id = parseRouteId();
    if (id === null) return;

    currentId.value = id;
    await loadCategoryStructure(id);
    loadArticles(id);
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

.sub-category-index {
    display: flex;
    width: 1000px;
    min-height: 500px;
    margin: 20px auto;
    align-items: stretch;
}

.left-nav {
    flex: 1;
    max-width: calc(1000px * (1 / 4));
    box-sizing: border-box;

    .parent-category {
        background-color: $primary-base;
        color: white;
        padding: 15px;
        text-align: center;
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 1px;
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
    max-width: calc(1000px * (3 / 4));
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
}
</style>
