<template>
    <div class="content-management">
        <div class="header">
            <h2>我的文章</h2>
        </div>

        <!-- 筛选区域 -->
        <div class="filters">
            <el-select
                v-model="filterStatus"
                placeholder="全部状态"
                clearable
                style="width: 120px"
            >
                <el-option
                    v-for="status in statusOptions"
                    :key="status"
                    :label="status"
                    :value="status"
                ></el-option>
            </el-select>

            <el-input
                v-model="searchTitle"
                placeholder="搜索标题"
                style="width: 240px; margin-left: 16px"
                clearable
                @keyup.enter="handleSearch"
            >
                <template #prefix>
                    <el-icon><Search /></el-icon>
                </template>
            </el-input>

            <el-button style="margin-left: 12px" @click="handleSearch"
                >搜索</el-button
            >
            <el-button style="margin-left: 8px" @click="resetFilters"
                >重置</el-button
            >
        </div>

        <!-- 加载中 -->
        <el-skeleton v-if="loading" :rows="5" animated />

        <!-- 文章列表 -->
        <div v-else-if="articleList.length > 0" class="article-list">
            <el-card
                v-for="article in articleList"
                :key="article.article_id"
                class="article-item"
                shadow="hover"
            >
                <template #header>
                    <div class="article-header">
                        <router-link
                            :to="`/article/${article.article_id}`"
                            target="_blank"
                            class="title-link"
                        >
                            {{ article.title }}
                        </router-link>
                        <el-tag
                            :type="getStatusType(article.status)"
                            size="small"
                        >
                            {{ article.status }}
                        </el-tag>
                    </div>
                </template>

                <div class="article-body">
                    <p class="excerpt">{{ getExcerpt(article.content) }}...</p>

                    <div class="meta">
                        <span>
                            分类：{{
                                article.Category?.category_name || '未分类'
                            }}
                        </span>
                        <span>
                            发布时间：{{
                                formatDate(article.publish_date) || '—'
                            }}
                        </span>
                    </div>

                    <div class="actions">
                        <el-button
                            size="small"
                            type="primary"
                            @click="editArticle(article.article_id)"
                        >
                            编辑
                        </el-button>
                        <el-button
                            size="small"
                            type="danger"
                            @click="deleteArticle(article.article_id)"
                        >
                            删除
                        </el-button>
                        <el-button
                            v-if="article.status === '已发布'"
                            size="small"
                            @click="previewArticle(article.article_id)"
                        >
                            预览
                        </el-button>
                    </div>
                </div>
            </el-card>
        </div>

        <!-- 空状态 -->
        <el-empty v-else description="暂无文章，快去写一篇吧！" />

        <!-- 分页 -->
        <el-pagination
            v-if="total > pageSize"
            class="pagination"
            background
            layout="total, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handlePageChange"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { debounce } from 'lodash-es';

// Stores
import { useUserStore } from '@/stores/userStore';

// APIs
import {
    getArticlesByUserAPI,
    deleteArticleAPI,
    type ArticleItem,
} from '@/api/article';

// 工具函数：格式化日期
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

// 状态
const statusTypeMap = {
    草稿: 'info',
    待审: 'warning',
    待发布: 'info',
    已发布: 'success',
    退回修订: 'danger',
    拒绝: 'danger',
} as const;

// 所有文章状态选项
const statusOptions = Object.keys(statusTypeMap);

// 获取标签类型
const getStatusType = (
    status: string
): 'success' | 'warning' | 'info' | 'danger' | '' => {
    return statusTypeMap[status as keyof typeof statusTypeMap] || 'info';
};

// Router
const router = useRouter();

// User Store
const userStore = useUserStore();
const userId = computed(() => userStore.userInfo.result.user_id);

// 状态
const loading = ref(false);
const articleList = ref<ArticleItem[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = 10;

// 筛选条件
const filterStatus = ref<string | undefined>(undefined);
const searchTitle = ref('');

// 截取文章内容摘要（去除 HTML 标签）
const getExcerpt = (content: string) => {
    const clean = content.replace(/<[^>]+>/g, '');
    return clean.length > 200 ? clean.slice(0, 200) : clean;
};

// 获取文章列表
const fetchArticles = async (page: number = 1) => {
    if (!userId.value) {
        ElMessage.warning('用户信息异常，请重新登录');
        return;
    }

    loading.value = true;
    try {
        const res = await getArticlesByUserAPI(
            Number(userId.value),
            page,
            pageSize
        );

        let filtered = res.data.list;

        // 前端过滤状态（如果后端支持，建议移至 API）
        if (filterStatus.value) {
            filtered = filtered.filter(
                (item) => item.status === filterStatus.value
            );
        }

        // 前端过滤标题关键词
        if (searchTitle.value.trim()) {
            const keyword = searchTitle.value.trim().toLowerCase();
            filtered = filtered.filter((item) =>
                item.title.toLowerCase().includes(keyword)
            );
        }

        articleList.value = filtered;
        total.value = res.data.total;
        currentPage.value = page;
    } catch (error) {
        console.error('加载文章失败:', error);
        ElMessage.error('加载文章失败');
        articleList.value = [];
        total.value = 0;
    } finally {
        loading.value = false;
    }
};

// 防抖搜索（300ms）
const debouncedSearch = debounce(() => {
    if (currentPage.value !== 1) {
        currentPage.value = 1;
    }
    fetchArticles(1);
}, 300);

// 监听搜索输入（自动触发防抖）
watch(searchTitle, () => {
    debouncedSearch();
});

// 手动搜索（Enter / 按钮）
const handleSearch = () => {
    debouncedSearch.cancel();
    if (currentPage.value !== 1) {
        currentPage.value = 1;
    }
    fetchArticles(1);
};

// 重置筛选
const resetFilters = () => {
    filterStatus.value = undefined;
    searchTitle.value = '';
    debouncedSearch.cancel();
    fetchArticles(1);
};

// 分页切换
const handlePageChange = (page: number) => {
    currentPage.value = page;
    fetchArticles(page);
};

// 操作方法
const editArticle = (id: number) => {
    const url = router.resolve(`/article/edit/${id}`).href;
    window.open(url, '_blank');
};

const previewArticle = (id: number) => {
    window.open(`/article/${id}`, '_blank');
};

const deleteArticle = async (id: number) => {
    try {
        await ElMessageBox.confirm(
            '确定要删除这篇文章？此操作不可恢复。',
            '警告',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );

        await deleteArticleAPI(id);
        ElMessage.success('删除成功');
        fetchArticles(currentPage.value);
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败');
        }
    }
};

// 初始化
onMounted(() => {
    fetchArticles(1);
});
</script>

<style lang="scss" scoped>
.content-management {
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h2 {
            margin: 0;
            color: #333;
            font-size: 20px;
        }
    }

    .filters {
        margin-bottom: 20px;
        display: flex;
        align-items: center;
    }

    .article-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

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

    .pagination {
        margin-top: 24px;
        display: flex;
        justify-content: center;
    }
}
</style>
