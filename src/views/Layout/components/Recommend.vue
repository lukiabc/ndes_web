<template>
    <div>
        <div class="title-box">
            <span class="title">推荐</span>
        </div>
        <div class="recommend-content">
            <div
                class="recommend-item"
                v-for="item in recommendList"
                :key="item.article_id"
            >
                <router-link
                    :to="`/article/${item.article_id}`"
                    class="recommend-title"
                    ><div class="recommend-title">
                        {{ item.title }}
                    </div></router-link
                >
                <div class="recommend-desc">
                    {{ analysisContent(item.content) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { analysisContent } from '@/utils/analysisContent';
import {
    getArticlesByParentCategoryAPI,
    type ArticleItem,
} from '@/api/article';

const route = useRoute();
const recommendList = ref<ArticleItem[]>([]);
const currentCategoryId = computed(() => {
    const id = route.params.id;
    return id ? (Array.isArray(id) ? Number(id[0]) : Number(id)) : NaN;
});

// 推荐数据
const getRecommendList = async () => {
    const res = await getArticlesByParentCategoryAPI(
        currentCategoryId.value,
        1,
        10
    );
    recommendList.value = res.data.list || [];
};

onMounted(() => {
    getRecommendList();
});

watch(
    () => route.params.id,
    (newId) => {
        if (newId) {
            getRecommendList();
        }
    }
);
</script>

<style lang="scss" scoped>
.title-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #e0e0e0;
}

.title {
    padding: 5px 15px;
    font-size: 16px;
    color: #0056b3;
    font-weight: bold;
    border-bottom: 2px solid #0056b3;
    margin-bottom: -2px;
}

.recommend-content {
    padding: 0 5px;
}

.recommend-title {
    font-weight: bold;
}
.recommend-desc {
    font-size: 14px;
    color: #666;
    margin: 5px 0;
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
