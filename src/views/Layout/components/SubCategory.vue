<template>
    <div>
        <!-- 子分类导航+列表 -->
        <div
            class="first"
            v-if="subCategoryList.length > 0 && subCategoryList.length < 10"
        >
            <div class="sub-category">
                <div class="nav-wrapper" v-if="subCategoryList.length < 10">
                    <router-link
                        v-for="item in subCategoryList"
                        :key="item.category_id"
                        :to="`/category/sub/${item.category_id}`"
                        class="nav-item"
                        :class="{ hovered: hoveredId === item.category_id }"
                        @mouseenter="onMouseEnter(item.category_id)"
                        @mouseleave="onMouseLeave()"
                    >
                        {{ item.category_name }}
                    </router-link>
                </div>
            </div>
            <div class="article-list">
                <div v-if="articleList.length === 0" class="no-content">
                    暂无相关内容
                </div>
                <div
                    class="sub-content"
                    v-for="item in articleList"
                    :key="item.article_id"
                >
                    <router-link :to="`/article/${item.article_id}`">
                        <span class="article-title">{{ item.title }}</span>
                    </router-link>
                    <div class="article-desc">
                        {{ analysisContent(item.content) }}
                    </div>
                    <span class="article-date">
                        <el-icon><Clock /></el-icon
                        >{{ formatDateTime(item.publish_date) }}</span
                    >
                </div>
            </div>
        </div>
        <!-- 子分类卡片展示 -->
        <div class="second" v-else>
            <div
                v-for="item in subCategoryList"
                :key="item.category_id"
                class="card"
            >
                <div class="title-box">
                    <router-link
                        :to="`/category/sub/${item.category_id}`"
                        class="card-title"
                    >
                        {{ item.category_name }}
                    </router-link>
                </div>
                <template v-if="item.firstArticle">
                    <router-link
                        :to="`/article/${item.firstArticle.article_id}`"
                        class="first-title"
                    >
                        {{ analysisContent(item.firstArticle.content) }}
                    </router-link>
                </template>
                <span v-else class="first-title no-article">暂无文章</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { getCategoryChildrenAPI } from '@/api/category';
import { getArticlesByCategoryAPI } from '@/api/article';
import { Clock } from '@element-plus/icons-vue';
import { analysisContent } from '@/utils/analysisContent';
import { useRoute } from 'vue-router';
import { formatDateTime } from '@/utils/formatDateTime';

const route = useRoute();
const subCategoryList: any = ref([]);
const hoveredId = ref<number | null>(null);
let hoverTimer: number | null = null;
const articleList: any = ref([]);

// 父分类 id
const parentCategoryId = computed(() => {
    const id = route.params.id;
    return id ? (Array.isArray(id) ? Number(id[0]) : Number(id)) : NaN;
});

// 子分类列表 + 每个分类的第一篇文章
const getSubCategoryList = async () => {
    const res = await getCategoryChildrenAPI(parentCategoryId.value);
    let list = res.data.data || [];

    // 如果是走 .second 分支（即 >=10） 才需要加载每类的第一篇文章
    if (list.length >= 10) {
        // 并发请求每个分类的第一篇已发布文章
        const articlePromises = list.map(async (category: any) => {
            try {
                const articleRes = await getArticlesByCategoryAPI(
                    category.category_id,
                    1,
                    1
                );
                const articles = articleRes.data.list || [];
                const firstPublished = articles.find(
                    (a: any) => a.status === '已发布'
                );
                return { ...category, firstArticle: firstPublished || null };
            } catch (error) {
                console.warn(
                    `加载分类 ${category.category_name} 的首篇文章失败:`,
                    error
                );
                return { ...category, firstArticle: null };
            }
        });

        list = await Promise.all(articlePromises);
    }

    subCategoryList.value = list;

    // 对于 .first 分支，仍需设置 hoveredId
    if (list.length > 0 && list.length < 10) {
        hoveredId.value = list[0].category_id;
    }
};

// 鼠标进入
const onMouseEnter = (id: number) => {
    if (hoverTimer) clearTimeout(hoverTimer);
    hoverTimer = window.setTimeout(() => {
        hoveredId.value = id;
    }, 300); // 延迟 0.3 秒
};

// 鼠标离开
const onMouseLeave = () => {
    if (hoverTimer) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
    }
};

// 加载文章列表
watch(hoveredId, async (newId) => {
    if (newId && Number.isInteger(newId) && newId > 0) {
        try {
            const res = await getArticlesByCategoryAPI(newId, 1, 10);
            let list = res.data.list || [];

            list = list.filter((item: any) => item.status === '已发布');
            articleList.value = list;
        } catch (error) {
            console.error('加载文章失败:', error);
            articleList.value = [];
        }
    }
});

onMounted(() => {
    getSubCategoryList();
});

watch(
    () => route.params.id,
    (newId) => {
        if (newId) {
            getSubCategoryList();
            hoveredId.value = null;
        }
    }
);

onUnmounted(() => {
    if (hoverTimer) clearTimeout(hoverTimer);
});
</script>

<style lang="scss" scoped>
.first {
    padding-top: 20px;
}

.sub-category {
    border-bottom: 1px solid #a30800;
    padding-bottom: 0px;
    margin-right: 20px;

    .nav-wrapper {
        display: flex;
        justify-content: start;
        align-items: center;
        padding: 6px 0;
    }

    .nav-item {
        font-size: 16px;
        color: inherit;
        text-decoration: none;
        padding: 6px 9px;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.3s ease;
        line-height: 1;
        position: relative;
    }

    .nav-item.hovered {
        color: white;
        background-color: #a30800;
        border-radius: 4px 4px 0 0;
        margin-bottom: -2px;
    }
}

.article-list {
    width: 660px;
    padding: 20px 10px;
    margin-right: 20px;
    font-size: 14px;

    .no-content {
        text-align: center;
        color: #999;
        padding: 40px 0;
        font-size: 16px;
    }

    .sub-content {
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: 20px;
    }

    .article-title {
        font-size: 18px;
        font-weight: bold;
    }

    .article-desc {
        color: #666;
        margin: 10px 0;
    }

    .article-date {
        display: inline-flex;
        align-items: center;
        margin-bottom: 20px;
        gap: 4px;
        color: #999;

        :deep(.el-icon) {
            transform: translateY(2px);
        }
    }
}

.second {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding-top: 20px;
    gap: 20px;
    width: 800px;
    font-size: 14px;

    .card {
        background-color: #f9f9f9;
        padding: 16px;
        border-radius: 4px;
        min-height: 100px;
    }

    .title-box {
        border-bottom: 1px solid #dddcdc;
        margin-bottom: 10px;
        padding: 4px 0;
        transition: all 0.3s ease;
        transform-origin: center;

        &:hover {
            transform: scale(1.1);
            border-bottom: 1px solid #a30800;
        }
    }

    .card-title {
        text-align: center;
        font-weight: bold;
        font-size: 16px;
        color: #0056b3;
        text-decoration: none;
        display: block;
        margin-bottom: 8px;

        &:hover {
            color: #a30800;
        }
    }

    .first-title {
        color: #666;
        font-size: 14px;
        display: inline-block;
        margin-bottom: 20px;

        .no-article {
            text-align: center;
            color: #999;
        }

        &:hover {
            color: #a30800;
        }
    }
}

:deep(a) {
    color: inherit;
    text-decoration: none;
}

:deep(a:hover) {
    color: #a30800;
    text-decoration: none;
}
</style>
