<template>
    <div class="review-article">
        <el-form :inline="true" class="btn-form" @submit.prevent>
            <el-form-item label="关键词">
                <el-input
                    v-model="searchKey"
                    placeholder="标题/内容关键词"
                    clearable
                    style="width: 200px"
                ></el-input>
            </el-form-item>
        </el-form>
        <el-table
            :data="articleList"
            style="width: 100%"
            border
            :loading="loading"
            empty-text="暂无需要审核的文章"
        >
            <el-table-column
                prop="article_id"
                label="ID"
                width="150"
                sortable
            />
            <el-table-column prop="title" label="标题" min-width="150" sortable>
                <template #default="scope">
                    <!-- 渲染高亮标题 -->
                    <span v-html="highlightText(scope.row.title, searchKey)" />
                </template>
            </el-table-column>

            <el-table-column label="内容摘要" min-width="200" sortable>
                <template #default="scope">
                    <span
                        v-html="
                            highlightText(
                                getExcerpt(scope.row.content),
                                searchKey
                            )
                        "
                    />
                </template>
            </el-table-column>
            <el-table-column label="父分类" width="120" sortable>
                <template #default="scope">
                    {{
                        scope.row.Category?.ParentCategory?.category_name ||
                        '无父分类'
                    }}
                </template>
            </el-table-column>

            <el-table-column label="子分类" width="180" sortable>
                <template #default="scope">
                    {{ scope.row.Category?.category_name || '未分类' }}
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button
                        size="small"
                        type="primary"
                        @click="handleReview(scope.row)"
                    >
                        审核
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
            class="pagination"
            background
            layout="total, prev, pager, next, sizes, jumper"
            :total="total"
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            size="small"
            :page-sizes="[10, 20, 30, 40, 50]"
            @size-change="loadArticles"
            @current-change="loadArticles"
        />
    </div>
</template>

<script lang="ts" setup>
import { getArticlesByStatus, type ArticleItem } from '@/api/article';
import { debounce } from 'lodash-es';
import { useRouter } from 'vue-router';
import { searchPendingArticlesAPI } from '@/api/article';
import { highlightText } from '@/utils/highlightText';

const articleList = ref<ArticleItem[]>([]);
const searchKey = ref('');
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const router = useRouter();

// 分页响应类型
interface PaginatedResponse<T> {
    total: number;
    page: number;
    pageSize: number;
    list: T[];
}

// 获取摘要
const getExcerpt = (content: string) => {
    const clean = content.replace(/<[^>]+>/g, '');
    return clean.length > 60 ? clean.slice(0, 60) + '...' : clean;
};

// 审核文章
const handleReview = (row: ArticleItem) => {
    router.push({
        name: 'articleDetailAdmin',
        params: { id: row.article_id },
        query: { mode: 'review' },
    });
};

// 加载文章
const loadArticles = async () => {
    loading.value = true;
    try {
        let res;
        const keyword = searchKey.value.trim();

        if (keyword) {
            // 搜索文章
            res = await searchPendingArticlesAPI(
                keyword,
                currentPage.value,
                pageSize.value
            );
        } else {
            // 加载所有待审文章
            res = await getArticlesByStatus(
                '待审',
                currentPage.value,
                pageSize.value
            );
        }

        const data = res.data as PaginatedResponse<ArticleItem>;
        articleList.value = data.list;
        total.value = data.total;
    } catch (error) {
        console.error('加载文章失败:', error);
        articleList.value = [];
        total.value = 0;
    } finally {
        loading.value = false;
    }
};

// 带防抖的搜索加载
const debouncedLoad = debounce(() => {
    currentPage.value = 1;
    loadArticles();
}, 300);

// 监听关键词变化
watch(searchKey, () => {
    debouncedLoad();
});

onMounted(() => {
    loadArticles();
});
</script>

<style lang="scss" scoped>
.review-article {
    padding: 20px;
}

.pagination {
    margin-top: 20px;
    justify-content: flex-start;
}
</style>
