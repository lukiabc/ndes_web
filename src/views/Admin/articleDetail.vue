<template>
    <div class="container">
        <div class="detail-container">
            <!-- 面包屑导航 -->
            <el-breadcrumb separator="/" class="breadcrumb">
                <el-breadcrumb-item :to="{ path: '/articleList' }"
                    >{{ parentCategoryName }}
                </el-breadcrumb-item>
                <el-breadcrumb-item>{{ childCategoryName }}</el-breadcrumb-item>
                <el-breadcrumb-item>正文</el-breadcrumb-item>
            </el-breadcrumb>

            <div v-if="loading" class="loading">
                <el-skeleton style="width: 100%" animated :rows="6" />
            </div>

            <div v-else-if="article" class="article-content">
                <h1 class="title">{{ article.title }}</h1>

                <div class="meta-info">
                    <span class="meta-item">来源：{{ article.source }}</span>
                    <span class="meta-item">编辑：{{ article.editor }}</span>
                    <span class="meta-item"
                        >发布时间：{{ formatDate(article.publish_date) }}</span
                    >
                    <el-tag :type="statusTagType(article.status)" size="small">
                        {{ article.status }}
                    </el-tag>
                </div>

                <el-divider />

                <!-- 富文本内容渲染 -->
                <div class="content-body" v-html="renderedContent" />

                <el-divider />

                <el-button icon="Back" @click="$router.back()"
                    >返回列表</el-button
                >
            </div>

            <div v-else class="not-found">
                <el-empty description="未找到该文章" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getArticleDetailAPI, type ArticleItem } from '@/api/article';
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const article = ref<ArticleItem | null>(null);
const loading = ref(false);

// 获取文章 ID
const articleId = Number(route.params.id);

// 加载文章详情
const loadArticle = async () => {
    if (!articleId) {
        ElMessage.error('无效的文章 ID');
        return;
    }

    loading.value = true;
    try {
        const res = await getArticleDetailAPI(articleId);
        article.value = res.data;
        console.log(article.value);
    } catch (error) {
        ElMessage.error('获取文章详情失败');
        console.error(error);
    } finally {
        loading.value = false;
    }
};

// 生命周期：挂载时加载
onMounted(() => {
    loadArticle();
});

// 格式化日期
const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
    )}-${String(date.getDate()).padStart(2, '0')} ${String(
        date.getHours()
    ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 状态标签颜色
const statusTagType = (status: string) => {
    return (
        { 已发布: 'success', 待审: 'warning', 草稿: 'info' }[status] || 'info'
    );
};

// 获取分类名称
const parentCategoryName = computed(() => {
    return article.value?.Category?.ParentCategory?.category_name || '未分类';
});
const childCategoryName = computed(() => {
    return article.value?.Category?.category_name || '无子分类';
});

// 渲染内容
const renderedContent = computed(() => {
    const content = article.value?.content || '';
    return content.replace(
        /http:\/\/localhost:3000/g,
        import.meta.env.VITE_IMAGE_DOMAIN || 'http://localhost:3000'
    );
});
</script>

<style>
.container {
    width: 100%;
    height: 100vh;
    padding: 20px;
    overflow: auto;
}

.detail-container {
    padding: 20px;
    max-width: 900px;
    height: 100%;
    margin: 0 auto;
    background-color: #fff;
}

.breadcrumb {
    font-size: 12px;
    color: #666;
}

.title {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin: 20px 0;
}

.content-body {
    margin: 0 40px;
}

.meta-item {
    margin-right: 20px;
    font-size: 12px;
    color: #888;
}
</style>
