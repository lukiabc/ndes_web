<template>
    <div>
        <div
            class="first"
            v-if="subCategoryList.length > 0 && subCategoryList.length < 10"
        >
            <div class="sub-category">
                <div class="nav-wrapper" v-if="subCategoryList.length < 10">
                    <router-link
                        v-for="item in subCategoryList"
                        :key="item.category_id"
                        :to="`/category/${item.category_id}`"
                        class="nav-item"
                        :class="{ hovered: hoveredId === item.category_id }"
                        @mouseenter="onMouseEnter(item.category_id)"
                        @mouseleave="onMouseLeave(item.category_id)"
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
                        >{{ formatDateTime(item.scheduled_publish_date) }}</span
                    >
                </div>
            </div>
        </div>
        <div class="second" v-else>第二部分</div>
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

// 子分类列表
const getSubCategoryList = async () => {
    const res = await getCategoryChildrenAPI(parentCategoryId.value);
    subCategoryList.value = res.data.data || [];

    if (subCategoryList.value.length > 0) {
        hoveredId.value = subCategoryList.value[0].category_id;
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
const onMouseLeave = (id: number) => {
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
            articleList.value = res.data.list || [];
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

:deep(a) {
    color: inherit;
    text-decoration: none;
}

:deep(a:hover) {
    color: #a30800;
    text-decoration: none;
}
</style>
