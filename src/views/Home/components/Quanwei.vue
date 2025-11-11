<template>
    <div class="authority-publish">
        <div class="nav-tabs">
            <span class="tab active">{{ title }}</span>
            <router-link :to="`/category/sub/${parentId}`" class="more"
                >更多 >></router-link
            >
        </div>

        <div class="article-list">
            <router-link
                v-for="item in articles"
                :key="item.article_id"
                :to="`/article/${item.article_id}`"
                class="article-item"
            >
                <div class="title">{{ item.title }}</div>
                <div class="date">
                    {{
                        item.publish_date
                            ? formatDateTime(item.publish_date)
                            : '未知'
                    }}
                </div>
            </router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getArticlesByParentCategoryAPI } from '@/api/article';
import { type ArticleItem } from '@/api/article';
import { useRoute } from 'vue-router';

const route = useRoute();

const currentPage = ref(1);
const articles = ref<ArticleItem[]>([]);
const title = ref('');
const parentId = ref(0);

const getArticles = async () => {
    try {
        const res = await getArticlesByParentCategoryAPI(
            2,
            currentPage.value,
            10
        );
        articles.value = res.data.list
            .filter((item) => item.status === '已发布')
            .slice(0, 7);
        title.value =
            articles.value[0].Category?.ParentCategory?.category_name || '';
        parentId.value =
            articles.value[0].Category?.ParentCategory?.category_id || 0;
    } catch (error) {
        console.error('获取文章失败:', error);
    }
};

const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
};

watch(
    () => route.path,
    (newPath) => {
        if (newPath === '/') {
            getArticles();
        }
    },
    { immediate: true }
);
</script>

<style scoped>
.authority-publish {
    font-family: 'Microsoft YaHei', sans-serif;
    background-color: #fff;
    height: 400px;
}

.nav-tabs {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    border-bottom: 2px solid #e0e0e0;
}

.tab {
    padding: 8px 12px;
    cursor: pointer;
    color: #333;
    font-size: 16px;
}

.tab.active {
    color: #0056b3;
    font-weight: bold;
    border-bottom: 2px solid #0056b3;
    margin-bottom: -2px;
}

.more {
    color: #0056b3;
    text-decoration: none;
    font-size: 14px;
}

.article-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.article-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px dashed #e0e0e0;
    cursor: pointer;
    transition: background-color 0.2s;
    text-decoration: none;
}

.article-item:hover {
    background-color: #f5f5f5;
}

.title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 16px;
    color: #333;
}

.date {
    font-size: 14px;
    color: #666;
    width: 100px;
    text-align: right;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
}

.pagination button {
    padding: 6px 12px;
    background: #f0f0f0;
    border: 1px solid #ccc;
    cursor: pointer;
    border-radius: 4px;
}

.pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
