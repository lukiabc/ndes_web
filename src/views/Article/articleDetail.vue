<template>
    <div
        class="article-detail-container"
        :class="{ 'backend-mode': isBackend }"
    >
        <div class="detail-container">
            <!-- 面包屑导航 -->
            <div class="breadcrumb-wrapper">
                <el-breadcrumb separator="/" class="breadcrumb">
                    <el-breadcrumb-item v-if="!isBackend" :to="{ path: '/' }">
                        首页
                    </el-breadcrumb-item>

                    <el-breadcrumb-item
                        :to="{
                            name: isBackend ? 'articleList' : 'category',
                            params: {
                                id: article?.Category?.ParentCategory
                                    ?.category_id,
                            },
                        }"
                    >
                        {{ parentCategoryName }}
                    </el-breadcrumb-item>
                    <el-breadcrumb-item
                        :to="{
                            name: isBackend ? 'articleList' : 'subCategory',
                            params: { id: article?.Category?.category_id },
                        }"
                    >
                        {{ childCategoryName }}
                    </el-breadcrumb-item>
                    <el-breadcrumb-item>正文</el-breadcrumb-item>
                </el-breadcrumb>

                <el-button
                    type="primary"
                    size="small"
                    @click="$router.back()"
                    class="back-button"
                >
                    返回
                </el-button>
            </div>

            <div v-if="loading" class="loading">
                <el-skeleton style="width: 100%" animated :rows="6" />
            </div>

            <div v-else-if="article" class="article-content">
                <h1 class="title">{{ article.title }}</h1>

                <div class="meta-info">
                    <span class="meta-item">来源：{{ article.source }}</span>
                    <span class="meta-item">编辑：{{ article.editor }}</span>
                    <span class="meta-item">
                        发布时间：{{ formatDate(article.publish_date) }}
                    </span>
                    <el-tag :type="statusTagType(article.status)" size="small">
                        {{ article.status }}
                    </el-tag>
                </div>

                <el-divider />

                <!-- 富文本内容渲染 -->
                <div class="content-body" v-html="renderedContent" />

                <el-divider />
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
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const article = ref<ArticleItem | null>(null);
const loading = ref(false);

// 判断是否为后台页面
const isBackend = computed(() => {
    return route.name === 'articleDetailAdmin';
});

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
    } catch (error) {
        ElMessage.error('获取文章详情失败');
        console.error(error);
    } finally {
        loading.value = false;
    }
};

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

// 渲染内容（替换图片域名）
const renderedContent = computed(() => {
    const content = article.value?.content || '';
    return content.replace(
        /http:\/\/localhost:3000/g,
        import.meta.env.VITE_IMAGE_DOMAIN || 'http://localhost:3000'
    );
});
</script>

<style scoped>
/* 前台模式：自然流式布局 */
.article-detail-container {
    width: 100%;
    padding: 20px;
}

/* 后台模式：固定高度 + 滚动 */
.article-detail-container.backend-mode {
    height: calc(100vh - 60px);
    overflow-y: auto;
    padding: 20px;
    box-sizing: border-box;
}

.detail-container {
    padding: 20px;
    max-width: 900px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.breadcrumb {
    font-size: 12px;
    color: #666;
    margin-bottom: 20px;
}

.breadcrumb-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin: 20px 0;
}

.meta-info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
    font-size: 12px;
    color: #888;
}

.content-body {
    margin: 0 40px;
    line-height: 1.8;
    color: #333;
}

.not-found {
    text-align: center;
    padding: 40px 0;
}
</style>
