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

                    <!-- 父分类 -->
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

                    <!-- 子分类 -->
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

                <div v-if="isReviewMode" class="review-section">
                    <h3 class="section-title">审核操作</h3>
                    <el-form
                        :model="reviewForm"
                        label-width="80px"
                        style="max-width: 600px"
                    >
                        <el-form-item label="审核结果">
                            <el-radio-group v-model="reviewForm.review_result">
                                <el-radio
                                    v-for="opt in reviewOptions"
                                    :key="opt.value"
                                    :label="opt.value"
                                    >{{ opt.label }}</el-radio
                                >
                            </el-radio-group>
                        </el-form-item>

                        <el-form-item label="审核意见">
                            <el-input
                                v-model="reviewForm.review_comments"
                                type="textarea"
                                :rows="4"
                                placeholder="请输入审核意见，或从下方快速选择"
                            />
                        </el-form-item>

                        <!-- 快速选择预设意见 -->
                        <el-form-item label="快速意见">
                            <div class="preset-comments">
                                <el-button
                                    v-for="(comment, index) in presetComments[
                                        reviewForm.review_result
                                    ]"
                                    :key="index"
                                    size="small"
                                    @click="
                                        reviewForm.review_comments = comment
                                    "
                                >
                                    {{ comment }}
                                </el-button>
                            </div>
                        </el-form-item>

                        <el-form-item>
                            <el-button
                                type="primary"
                                @click="submitReview"
                                :loading="submitting"
                            >
                                提交审核
                            </el-button>
                            <el-button @click="$router.back()">取消</el-button>
                        </el-form-item>
                    </el-form>
                </div>
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
import { useRoute, useRouter } from 'vue-router';
import { reviewArticleAPI } from '@/api/reviews';
import { useUserStore } from '@/stores/userStore';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const article = ref<ArticleItem | null>(null);
const loading = ref(false);

// 审核选项配置
const reviewOptions = [
    { value: '通过', label: '通过' },
    { value: '退回修订', label: '退回修订' },
    { value: '拒绝', label: '拒绝' },
] as const;

// 预设审核意见
const presetComments = {
    通过: [
        '符合平台内容标准，无违规风险，同意发布。',
        '内容原创性良好，结构完整，审核通过。',
        '符合栏目定位，内容健康有益，审核通过。',
        '无事实错误与逻辑漏洞，同意按计划发布时间发布。',
    ],
    退回修订: [
        '语言表达不规范，请润色后再提交。',
        '数据来源未标注，请注明引用出处。',
        '标题与正文内容不符，建议修改标题或调整内容。',
        '存在主观臆断，建议补充客观依据。',
        '格式不符合投稿规范，请参照模板调整。',
    ],
    拒绝: [
        '内容违反平台政策，不予发布。',
        '涉嫌抄袭或侵权，审核不通过。',
        '主题不符合本平台定位，拒绝发布。',
        '涉及敏感政治话题，不符合内容安全规范。',
        '广告营销性质过强，不符合内容要求。',
        '内容低质、拼凑或无实质信息，拒绝发布。',
    ],
} satisfies Record<ReviewResult, string[]>;

type ReviewResult = (typeof reviewOptions)[number]['value'];

// 审核表单数据
const reviewForm = ref<{
    review_result: ReviewResult;
    review_comments: string;
}>({
    review_result: reviewOptions[0].value,
    review_comments: '',
});
const submitting = ref(false);

// 提交审核
const submitReview = async () => {
    if (!article.value) {
        ElMessage.warning('文章信息未加载');
        return;
    }

    const userId = userStore.userInfo.result.user_id;
    submitting.value = true;
    try {
        await reviewArticleAPI(article.value.article_id, {
            reviewer: Number(userId),
            review_result: reviewForm.value.review_result,
            review_comments:
                reviewForm.value.review_comments.trim() || undefined,
        });

        ElMessage.success('审核提交成功！');
        router.push({ name: 'reviewArticleList' });
    } catch (error) {
        ElMessage.error(error?.response?.data?.message || '审核失败，请重试');
        console.error('审核错误:', error);
    } finally {
        submitting.value = false;
    }
};

// 判断是否为审核模式
const isReviewMode = computed(() => {
    return route.query.mode === 'review';
});

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

// 渲染内容
const renderedContent = computed(() => {
    let content = article.value?.content || '';
    // 只有在开发环境且内容包含 localhost 时才替换
    if (import.meta.env.DEV) {
        content = content.replace(
            /http:\/\/localhost:3000/g,
            import.meta.env.VITE_IMAGE_DOMAIN || 'http://localhost:3000'
        );
    }
    return content;
});
</script>

<style scoped>
.article-detail-container {
    width: 100%;
    padding: 20px;
}

.article-detail-container.backend-mode {
    height: calc(100vh - 10px);
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

.section-title {
    margin: 20px 10px;
}

.preset-comments {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 8px 0;
}

.preset-comments .el-button--small {
    padding: 6px 10px;
    font-size: 12px;
}
</style>
