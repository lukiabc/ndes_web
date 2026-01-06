<template>
    <div class="article-list">
        <!-- 搜索表单 inline 布局，支持关键词、分类、状态筛选 -->
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

        <!-- 文章表格 -->
        <el-table
            :data="articles"
            style="width: 100%"
            border
            :loading="loading"
            empty-text="暂无文章"
        >
            <el-table-column
                prop="article_id"
                label="文章ID"
                width="100"
                sortable
            />

            <el-table-column prop="title" label="标题" min-width="150" sortable>
                <template #default="scope">
                    <!-- 跳转详情 -->
                    <el-link type="primary" @click="handleView(scope.row)">
                        <!-- 标题关键词高亮 -->
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
                    <!-- 内容摘要关键词高亮 -->
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
                    {{ scope.row.publish_date }}
                </template>
            </el-table-column>

            <el-table-column prop="status" label="状态" width="100" sortable>
                <template #default="scope">
                    <el-tag :type="statusTagType(scope.row.status)">
                        {{ scope.row.status }}
                    </el-tag>
                </template>
            </el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" min-width="100">
                <template #default="scope">
                    <el-button
                        size="small"
                        :type="getCarouselButtonClass(scope.row)"
                        @click="handleCarouselAction(scope.row)"
                        :disabled="
                            !scope.row.article_id ||
                            scope.row.status !== '已发布'
                        "
                    >
                        {{
                            !scope.row.inCarousel
                                ? '加入轮播图'
                                : scope.row.isCarouselActiveNow
                                ? '已在轮播'
                                : getCarouselButtonTextByTime(
                                      scope.row.carouselItem
                                  )
                        }}
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

    <!-- 轮播图详情弹窗 -->
    <CarouselDetailDialog
        v-model="dialogVisible"
        :carousel-item="selectedCarousel"
        @close="selectedCarousel = null"
    />

    <!-- 加入轮播图弹窗 -->
    <AddToCarouselDialog
        v-model:visible="addToCarouselDialogVisible"
        :article-id="selectedArticleForCarousel?.article_id || 0"
        :article-title="selectedArticleForCarousel?.title || ''"
        @success="onAddToCarouselSuccess"
    />
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

import {
    getArticleListAPI,
    getArticlesByCategoryAPI,
    searchArticlesAPI,
    getArticlesByStatus,
    getStatusAPI,
    type ArticleItem,
} from '@/api/article';
import { getCategoryListAPI } from '@/api/category';
import { getCarouselsAPI, type Carousel } from '@/api/carousels';
import { formatDateTime } from '@/utils/formatDateTime';

import AddToCarouselDialog from '@/views/Admin/components/AddToCarouselDialog.vue';
import CarouselDetailDialog from '@/views/Admin/components/CarouselDetailDialog.vue';

// 分类结构
interface Category {
    category_id: string;
    category_name: string;
    parent_id: number | null;
}

// 分页响应结构
interface PaginatedResponse<T> {
    total: number;
    page: number;
    pageSize: number;
    list: T[];
}

// 文章项扩展，包含轮播图信息
interface ArticleItemWithCarousel extends ArticleItem {
    inCarousel?: boolean;
    carouselItem?: Carousel | null;
    isCarouselActiveNow?: boolean;
}

const router = useRouter();

// 状态选项列表
const statusOptions = ref<{ label: string; value: string }[]>([]);
const categories = ref<{ id: string; name: string }[]>([]); // 分类列表
const articles = ref<ArticleItemWithCarousel[]>([]); // 文章列表
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

// 轮播图项映射表
const activeCarouselsMap = ref<Map<number, Carousel>>(new Map());
const dialogVisible = ref(false); // 轮播图详情弹窗控制
// 当前选中的轮播图项，用于详情弹窗
const selectedCarousel = ref<Carousel | null>(null);

// 加入轮播图弹窗控制
const addToCarouselDialogVisible = ref(false);
// 当前选中的文章项，用于加入轮播图
const selectedArticleForCarousel = ref<ArticleItemWithCarousel | null>(null);

// 搜索表单响应式数据
const searchForm = reactive({
    keyword: '',
    categoryId: undefined as number | undefined,
    status: undefined as string | undefined,
});

// 解析日期字符串为本地时间
const parseDateAsLocal = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// 获取文章状态标签类型
const statusTagType = (status: string) => {
    return (
        {
            已发布: 'success',
            待审: 'warning',
            草稿: 'info',
            拒绝: 'danger',
            退回修订: 'warning',
        }[status] || 'info'
    );
};

// 截取文章内容摘要
const getExcerpt = (content: string) => {
    const clean = content.replace(/<[^>]+>/g, '');
    return clean.length > 60 ? clean.slice(0, 60) + '...' : clean;
};

// 高亮
const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');
    return text.replace(
        regex,
        '<mark style="background: #ffecd3; padding: 0 2px;">$1</mark>'
    );
};

// 判断轮播项当前是否实际生效
const isCarouselActiveNow = (item: Carousel): boolean => {
    if (!item.is_active) return false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 本地日期（忽略时分秒）

    const start = item.start_play_date
        ? parseDateAsLocal(item.start_play_date)
        : null;
    const end = item.end_play_date
        ? parseDateAsLocal(item.end_play_date)
        : null;

    if (start && today < start) return false;
    if (end && today > end) return false;

    return true;
};

// 根据文章轮播状态返回按钮样式类型
const getCarouselButtonClass = (article: ArticleItemWithCarousel): string => {
    if (!article.inCarousel) {
        return 'primary'; // “加入轮播图”
    }
    const item = article.carouselItem;
    if (!item) {
        return 'success'; // 兜底
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const start = item.start_play_date
        ? parseDateAsLocal(item.start_play_date)
        : null;
    const end = item.end_play_date
        ? parseDateAsLocal(item.end_play_date)
        : null;

    if (!item.is_active) {
        return 'danger'; // 已停用
    }

    if (start && today < start) {
        return 'warning'; // 未开始
    }

    if (end && today > end) {
        return 'info'; // 已过期
    }

    return 'success'; // 已在轮播
};

// 根据轮播项状态返回按钮文字
const getCarouselButtonTextByTime = (item: Carousel | null): string => {
    if (!item) return '已在轮播';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const start = item.start_play_date
        ? parseDateAsLocal(item.start_play_date)
        : null;
    const end = item.end_play_date
        ? parseDateAsLocal(item.end_play_date)
        : null;

    if (!item.is_active) {
        return '已停用';
    }

    if (start && today < start) {
        return '未开始';
    }

    if (end && today > end) {
        return '已过期';
    }
    return '已在轮播';
};

// 获取文章状态列表 用于搜索下拉筛选
const getStatus = async () => {
    try {
        const res = await getStatusAPI();
        statusOptions.value = res.data.map((item: any) => ({
            label: item.status,
            value: item.status,
        }));
    } catch (error) {
        ElMessage.error('加载状态列表失败');
        statusOptions.value = [
            { label: '草稿', value: '草稿' },
            { label: '待审', value: '待审' },
            { label: '已发布', value: '已发布' },
            { label: '退回修订', value: '退回修订' },
            { label: '拒绝', value: '拒绝' },
        ];
    }
};

// 获取分类列表 用于搜索下拉筛选
const loadCategories = async () => {
    try {
        const res = await getCategoryListAPI();
        const allCategories = res.data as Category[];
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

// 获取所有轮播图中的文章ID 用于标记文章是否在轮播图中
const loadCarouselArticleIds = async () => {
    try {
        const res = await getCarouselsAPI();
        const map = new Map<number, Carousel>();
        (res.data.list || []).forEach((item: Carousel) => {
            if (item.article_id) {
                map.set(item.article_id, item);
            }
        });
        activeCarouselsMap.value = map;
        markArticlesWithCarousel(); // 更新文章的轮播状态
    } catch (err) {
        console.warn('加载轮播图状态失败，不影响主流程');
    }
};

// 标记文章是否在轮播图中 根据 activeCarouselsMap 标记是否在轮播、是否生效
const markArticlesWithCarousel = () => {
    articles.value = [...articles.value].map((article) => {
        const carouselItem = activeCarouselsMap.value.get(article.article_id);
        if (carouselItem) {
            return {
                ...article,
                inCarousel: true,
                carouselItem,
                isCarouselActiveNow: isCarouselActiveNow(carouselItem),
            };
        } else {
            return {
                ...article,
                inCarousel: false,
                carouselItem: null,
                isCarouselActiveNow: false,
            };
        }
    });
};

// 防抖搜索定时器
let searchTimer: ReturnType<typeof setTimeout>;
// 防抖搜索
const debouncedSearch = (value: string) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        if (value.trim() || !searchForm.categoryId) {
            currentPage.value = 1;
            loadArticles();
        }
    }, 500);
};

// 加载文章列表
const loadArticles = async () => {
    loading.value = true;
    try {
        currentPage.value = Math.max(1, currentPage.value);
        const keyword = searchForm.keyword.trim();

        let res;
        if (keyword) {
            // 关键词搜索
            res = await searchArticlesAPI(
                keyword,
                currentPage.value,
                pageSize.value
            );
            const data = res.data as any;
            articles.value = data.list;
            total.value = data.total;
        } else if (searchForm.categoryId) {
            // 分类搜索
            res = await getArticlesByCategoryAPI(
                searchForm.categoryId,
                currentPage.value,
                pageSize.value
            );
            const data = res.data as PaginatedResponse<ArticleItem>;
            articles.value = data.list;
            total.value = data.total;
        } else if (searchForm.status) {
            // 状态搜索
            res = await getArticlesByStatus(
                searchForm.status,
                currentPage.value,
                pageSize.value
            );
            const data = res.data as PaginatedResponse<ArticleItem>;
            articles.value = data.list;
            total.value = data.total;
        } else {
            // 全部文章
            res = await getArticleListAPI(currentPage.value, pageSize.value);
            const data = res.data as PaginatedResponse<ArticleItem>;
            articles.value = data.list;
            total.value = data.total;
        }

        // 更新每篇文章的轮播状态
        markArticlesWithCarousel();
    } catch (err) {
        ElMessage.error('获取文章失败，请稍后重试');
        articles.value = [];
        total.value = 0;
    } finally {
        loading.value = false;
    }
};

// 查看文章详情
const handleView = (row: ArticleItem) => {
    router.push(`/articleDetail/${row.article_id}`);
};

// 处理轮播图操作
const handleCarouselAction = (article: ArticleItemWithCarousel) => {
    // 仅允许‘已发布’文章操作
    if (article.status !== '已发布') {
        ElMessage.warning('仅“已发布”文章可加入轮播图');
        return;
    }

    if (article.inCarousel) {
        // 已在轮播 → 打开详情弹窗
        const item = activeCarouselsMap.value.get(article.article_id);
        if (item) {
            selectedCarousel.value = item;
            dialogVisible.value = true;
        } else {
            ElMessage.warning('未找到对应的轮播图记录');
        }
    } else {
        // 未加入 → 打开“加入轮播”弹窗
        selectedArticleForCarousel.value = article;
        addToCarouselDialogVisible.value = true;
    }
};

// 加入轮播图成功后，重新加载轮播数据
const onAddToCarouselSuccess = async () => {
    await loadCarouselArticleIds();
};

// 监听分页参数变化，重新加载文章列表
watch([currentPage, pageSize], () => {
    loadArticles();
});

onMounted(() => {
    loadCarouselArticleIds(); // 初始化轮播图数据
    loadArticles(); // 初始化文章列表
    loadCategories(); // 初始化分类列表
    getStatus(); // 初始化文章状态列表
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
