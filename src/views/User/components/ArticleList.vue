<!-- 文章列表 -->
<template>
    <el-card class="article-item" shadow="hover">
        <template #header>
            <div class="article-header">
                <router-link
                    :to="`/article/${article.article_id}`"
                    target="_blank"
                    class="title-link"
                >
                    {{ article.title }}
                </router-link>
                <el-tag :type="getStatusType(article.status)" size="small">
                    {{ article.status }}
                </el-tag>
            </div>
        </template>

        <div class="article-body">
            <p class="excerpt">{{ getExcerpt(article.content) }}...</p>

            <div class="meta">
                <span
                    >分类：{{
                        article.Category?.category_name || '未分类'
                    }}</span
                >
                <span>来源：{{ article.source }}</span>
                <span v-if="showPublishDate">
                    发布时间：{{ formatDate(article.publish_date) || '—' }}
                </span>
            </div>

            <div class="actions">
                <!-- 草稿才显示编辑按钮 -->
                <el-button
                    v-if="article.status === '草稿'"
                    size="small"
                    type="primary"
                    @click="$emit('edit', article.article_id)"
                >
                    {{ draftMode ? '继续编辑' : '编辑' }}
                </el-button>

                <el-button
                    size="small"
                    type="danger"
                    @click="$emit('delete', article.article_id)"
                >
                    删除
                </el-button>
            </div>
        </div>
    </el-card>
</template>

<script lang="ts" setup>
import { type ArticleItem } from '@/api/article';

const props = defineProps<{
    article: ArticleItem;
    draftMode?: boolean; // 控制按钮文案和是否显示预览
    showPublishDate?: boolean; // 草稿箱可隐藏发布时间
}>();

const emit = defineEmits<{
    (e: 'edit', id: number): void;
    (e: 'delete', id: number): void;
    (e: 'preview', id: number): void;
}>();

// 格式化日期
const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// 获取文章摘要
const getExcerpt = (content: string) => {
    const clean = content.replace(/<[^>]+>/g, '');
    return clean.length > 200 ? clean.slice(0, 200) : clean;
};

const statusTypeMap = {
    草稿: 'info',
    待审: 'warning',
    待发布: 'info',
    已发布: 'success',
    退回修订: 'danger',
    拒绝: 'danger',
} as const;

const getStatusType = (status: string) => {
    return statusTypeMap[status as keyof typeof statusTypeMap] || 'info';
};
</script>

<style lang="scss" scoped>
.article-item {
    .article-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .title-link {
            font-weight: 600;
            font-size: 16px;
            color: #1a73e8;
            text-decoration: none;
            &:hover {
                text-decoration: underline;
            }
        }
    }

    .excerpt {
        color: #666;
        line-height: 1.5;
        margin: 10px 0;
    }

    .meta {
        font-size: 12px;
        color: #999;
        display: flex;
        gap: 20px;
        margin: 8px 0;
    }

    .actions {
        margin-top: 12px;
        display: flex;
        gap: 10px;
    }
}
</style>
