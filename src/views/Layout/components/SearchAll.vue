<template>
    <div class="search-all">
        <div class="search-box">
            <div class="search-prompt">
                您要检索的是：{{ route.query.keyword }}
            </div>

            <el-empty
                v-if="!loading && articles.length === 0 && isValidKeyword"
                description="暂无相关内容"
                :image-size="100"
                class="no-results"
            />

            <div
                class="search-list"
                v-for="item in articles"
                :key="item.article_id"
            >
                <router-link
                    :to="`/article/${item.article_id}`"
                    class="search-title"
                    v-html="sanitizeHtml(item.title)"
                    target="_blank"
                >
                </router-link>
                <div
                    class="search-content"
                    v-html="sanitizeHtml(item.content)"
                ></div>
                <div class="search-desc">
                    <span class="search-author">作者：{{ item.editor }}</span>
                    <span class="search-category">
                        分类：
                        {{
                            item.Category.ParentCategory?.category_name
                                ? `${item.Category.ParentCategory.category_name} / ${item.Category.category_name}`
                                : item.Category.category_name || '未分类'
                        }}
                    </span>
                    <span class="search-time">
                        时间：{{ formatDate(item.publish_date) }}
                    </span>
                </div>
            </div>

            <!-- 分页组件 -->
            <el-pagination
                v-if="total > 0"
                class="pagination"
                background
                layout="total, prev, pager, next, sizes, jumper"
                :total="total"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                size="small"
                :page-sizes="[10, 20, 30, 40, 50]"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import DOMPurify from 'dompurify';
import { searchArticlesAPI, type ArticleItem } from '@/api/article';
import { ElMessage } from 'element-plus';

const route = useRoute();

// 分页状态
const currentPage = ref(1);
const pageSize = ref(10);

// 搜索结果
const articles = ref<ArticleItem[]>([]);
const total = ref(0);
const loading = ref(false);

// 判断是否有有效关键词
const isValidKeyword = computed(() => {
    const kw = route.query.keyword;
    return typeof kw === 'string' && kw.trim() !== '';
});

// 渲染 HTML
const sanitizeHtml = (html: string) => {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['mark'],
        ALLOWED_ATTR: ['class'],
    });
};

// 获取搜索结果
const fetchSearchResults = async () => {
    if (!isValidKeyword.value) {
        articles.value = [];
        total.value = 0;
        return;
    }
    loading.value = true;
    try {
        const res = await searchArticlesAPI(
            route.query.keyword!.toString().trim(),
            currentPage.value,
            pageSize.value,
            'published'
        );
        articles.value = res.data.list;
        total.value = res.data.total;
    } catch (err) {
        console.error('搜索失败', err);
        ElMessage.error('搜索失败，请重试');
        articles.value = [];
        total.value = 0;
    } finally {
        loading.value = false;
    }
};

// 分页事件
const handleSizeChange = (newSize: number) => {
    pageSize.value = newSize;
    currentPage.value = 1;
    fetchSearchResults();
};

const handleCurrentChange = (newPage: number) => {
    currentPage.value = newPage;
    fetchSearchResults();
};

// 监听关键词变化
watch(
    () => route.query.keyword,
    () => {
        currentPage.value = 1;
        fetchSearchResults();
    },
    { immediate: true }
);

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
</script>

<style lang="scss" scoped>
@use '@/style/element-variables.scss' as *;

.search-all {
    padding: 20px;
    min-height: 800px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.search-box {
    width: 800px;

    .search-prompt {
        color: #666;
        margin-bottom: 20px;
        font-weight: bold;
    }

    .no-results {
        margin: 40px 0;
    }

    .pagination {
        margin-top: 20px;
        justify-content: center;
    }
}

mark {
    color: #a30800;
    font-weight: bold;
    background-color: transparent;
}

.search-list {
    border-top: 1px dashed #ccc;
    margin: 20px 0;
    padding: 20px 10px;

    .search-title {
        font-size: 16px;
        font-weight: 550;
        color: $primary-base;
        text-decoration: none;
        display: block;
        margin-bottom: 8px;

        &:visited {
            color: #0056b3;
        }

        &:hover {
            color: $primary-light-3;
        }
    }

    .search-content {
        font-size: 14px;
        color: #333;
        padding: 20px 0;
        line-height: 1.6;
    }

    .search-desc {
        display: flex;
        justify-content: start;
        gap: 30px;
        margin-right: 20px;
        font-size: 12px;
        color: #666;
    }
}
</style>
