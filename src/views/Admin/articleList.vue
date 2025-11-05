<template>
    <div class="article-list">
        <el-form :inline="true" class="search-form" @submit.prevent>
            <el-form-item label="关键词">
                <el-input
                    v-model="searchForm.keyword"
                    placeholder="标题/内容关键词"
                    clearable
                    @input="debouncedSearch"
                    style="width: 200px"
                />
            </el-form-item>

            <el-form-item label="分类">
                <el-select
                    v-model="searchForm.categoryId"
                    placeholder="请选择分类"
                    clearable
                    @change="loadArticles"
                    style="width: 180px"
                >
                    <el-option
                        v-for="cat in categories"
                        :key="cat.id"
                        :label="cat.name"
                        :value="cat.id"
                    />
                </el-select>
            </el-form-item>

            <el-form-item label="状态">
                <el-select
                    v-model="searchForm.status"
                    placeholder="全部状态"
                    clearable
                    @change="loadArticles"
                    style="width: 140px"
                >
                    <el-option
                        v-for="item in statusOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
        </el-form>

        <el-table
            :data="articles"
            style="width: 100%"
            border
            :loading="loading"
            empty-text="暂无文章"
        >
            <el-table-column prop="article_id" label="ID" width="80" sortable />

            <el-table-column prop="title" label="标题" min-width="150" sortable>
                <template #default="scope">
                    <el-link type="primary" @click="handleView(scope.row)">
                        <!-- 渲染高亮标题 -->
                        <span
                            v-html="
                                highlightText(
                                    scope.row.title,
                                    searchForm.keyword
                                )
                            "
                        />
                    </el-link>
                </template>
            </el-table-column>

            <el-table-column label="内容摘要" min-width="200" sortable>
                <template #default="scope">
                    <span
                        v-html="
                            highlightText(
                                getExcerpt(scope.row.content),
                                searchForm.keyword
                            )
                        "
                    />
                </template>
            </el-table-column>

            <el-table-column label="父分类" width="150" sortable>
                <template #default="scope">
                    {{
                        scope.row.Category?.ParentCategory?.category_name ||
                        '无父分类'
                    }}
                </template>
            </el-table-column>

            <el-table-column label="子分类" width="150" sortable>
                <template #default="scope">
                    {{ scope.row.Category?.category_name || '未分类' }}
                </template>
            </el-table-column>

            <el-table-column
                prop="publish_date"
                label="发布时间"
                width="180"
                sortable
            >
                <template #default="scope">
                    {{ formatDate(scope.row.publish_date) }}
                </template>
            </el-table-column>

            <el-table-column prop="status" label="状态" width="100" sortable>
                <template #default="scope">
                    <el-tag :type="statusTagType(scope.row.status)">
                        {{ scope.row.status }}
                    </el-tag>
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

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import {
    getArticleListAPI,
    getArticlesByCategoryAPI,
    searchArticlesAPI,
    getArticlesByStatus,
    type ArticleItem,
    type SearchResponse,
} from '@/api/article';
import { getCategoryListAPI } from '@/api/category';
const router = useRouter();

// 分类数据定义
interface Category {
    category_id: string;
    category_name: string;
    parent_id: number | null;
}

// 分页响应类型
interface PaginatedResponse<T> {
    total: number;
    page: number;
    pageSize: number;
    list: T[];
}

// 状态选项
const statusOptions = [
    { label: '草稿', value: '草稿' },
    { label: '待审', value: '待审' },
    { label: '已发布', value: '已发布' },
];

// 分类列表
const categories = ref<{ id: string; name: string }[]>([]);

// 搜索与筛选条件
const searchForm = reactive({
    keyword: '',
    categoryId: undefined as number | undefined, // 分类
    status: undefined as string | undefined, // 状态
});

const articles = ref<ArticleItem[]>([]); // 文章列表
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

// 加载分类列表
const loadCategories = async () => {
    try {
        const res = await getCategoryListAPI();
        const allCategories = res.data as Category[];

        // 提取二级分类(parent_id 不为 null)
        categories.value = allCategories
            .filter((cat) => cat.parent_id !== null)
            .map((cat) => ({
                id: cat.category_id,
                name: cat.category_name,
            }));
    } catch (error) {
        ElMessage.error('加载分类列表失败');
    }
};

// 防抖搜索
let searchTimer: ReturnType<typeof setTimeout>;
const debouncedSearch = (value: string) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        if (value.trim() || !searchForm.categoryId) {
            currentPage.value = 1; // 搜索时重置页码
            loadArticles();
        }
    }, 500);
};

// 获取图片 URL 列表
const getMediaUrls = (mediaList: ArticleItem['Media']) => {
    return mediaList?.map((m) => m.media_url) || [];
};

// 状态标签颜色
const statusTagType = (status: string) => {
    return (
        { 已发布: 'success', 待审: 'warning', 草稿: 'info' }[status] || 'info'
    );
};

// 格式化日期
const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
    )}-${String(date.getDate()).padStart(2, '0')}
        ${String(date.getHours()).padStart(2, '0')}:${String(
        date.getMinutes()
    ).padStart(2, '0')}`;
};

// 获取摘要
const getExcerpt = (content: string) => {
    const clean = content.replace(/<[^>]+>/g, '');
    return clean.length > 60 ? clean.slice(0, 60) + '...' : clean;
};

// 高亮关键词（支持 HTML 渲染）
const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');
    return text.replace(
        regex,
        '<mark style="background: #ffecd3; padding: 0 2px;">$1</mark>'
    );
};

// 加载数据
const loadArticles = async () => {
    loading.value = true;
    try {
        let res;
        currentPage.value = Math.max(1, currentPage.value); // 防非法页码

        const keyword = searchForm.keyword.trim();

        if (keyword) {
            // 关键词搜索
            res = await searchArticlesAPI(
                keyword,
                currentPage.value,
                pageSize.value
            );
            const data = res.data as SearchResponse;
            articles.value = data.list;
            total.value = data.total;
        } else if (searchForm.categoryId) {
            // 按分类查询
            res = await getArticlesByCategoryAPI(
                searchForm.categoryId,
                currentPage.value,
                pageSize.value
            );
            const data = res.data as PaginatedResponse<ArticleItem>;
            articles.value = data.list;
            total.value = data.total;
        } else if (searchForm.status) {
            // 按状态查询
            res = await getArticlesByStatus(
                searchForm.status,
                currentPage.value,
                pageSize.value
            );
            const data = res.data as PaginatedResponse<ArticleItem>;
            articles.value = data.list;
            total.value = data.total;
        } else {
            //无筛选
            res = await getArticleListAPI(currentPage.value, pageSize.value);
            const data = res.data as PaginatedResponse<ArticleItem>;
            articles.value = data.list;
            total.value = data.total;
        }
    } catch (err) {
        ElMessage.error('获取文章失败，请稍后重试');
        articles.value = [];
        total.value = 0;
    } finally {
        loading.value = false;
    }
};

// 查看详情
const handleView = (row: ArticleItem) => {
    router.push(`/articleDetail/${row.article_id}`);
};

// 监听分页变化
watch([currentPage, pageSize], () => {
    loadArticles();
});

onMounted(() => {
    loadArticles(); // 加载文章列表
    loadCategories(); // 加载分类列表
});
</script>

<style scoped>
.article-list {
    padding: 20px;
}

.search-form {
    margin-bottom: 20px;
}

.pagination {
    margin-top: 20px;
    justify-content: flex-start;
}
</style>
