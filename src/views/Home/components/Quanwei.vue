<template>
    <div class="authority-publish">
        <div class="nav-tabs">
            <span class="tab active">权威发布</span>
            <router-link to="/" class="more">更多 >></router-link>
        </div>

        <div class="article-list">
            <div
                v-for="item in articles"
                :key="item.article_id"
                class="article-item"
                @click="goToDetail(item.article_id)"
            >
                <div class="title">{{ item.title }}</div>
                <div class="date">
                    {{
                        item.publish_date
                            ? formatDateTime(item.publish_date)
                            : '未知'
                    }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getArticlesByCategoryAPI } from '@/api/article';
import { type ArticleItem } from '@/api/article';

const currentPage = ref(1);
const articles = ref<ArticleItem[]>([]);

const getArticles = async () => {
    try {
        const res = await getArticlesByCategoryAPI(2, currentPage.value, 10);
        articles.value = res.data.list
            .filter((item) => item.status === '已发布' &&
        item.Category?.category_name === '权威发布' )
            .slice(0, 7);
    } catch (error) {
        console.error('获取文章失败:', error);
    }
};

onMounted(() => {
    getArticles();
});

const goToDetail = (id: number) => {
    window.location.href = `/article/${id}`;
};

const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
};
</script>

<style scoped>
.authority-publish {
    font-family: 'Microsoft YaHei', sans-serif;
    padding: 20px;
    background-color: #fff;
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
