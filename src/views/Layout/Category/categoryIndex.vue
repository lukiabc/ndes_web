<template>
    <div class="home-container">
        <div class="content-row">
            <Carousel class="carousel" :list="ArticleCarouselList" />
            <Recommend class="recommend" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import Carousel from '@/components/Carousel.vue';
import Recommend from '@/views/Layout/components/Recommend.vue';
import { useRoute } from 'vue-router';
import {
    getArticlesByParentCategoryAPI,
    type ArticleItem,
} from '@/api/article';

const route = useRoute();
const articleList: any = ref([]); // 文章列表
const ArticleCarouselList: any = ref([]); // 文章轮播图列表

// 从路由参数中获取 category_id
const currentCategoryId = Number(route.params.id);

const getArticleCarouselList = async () => {
    const res = await getArticlesByParentCategoryAPI(currentCategoryId);
    articleList.value = res.data.list;
    ArticleCarouselList.value = res.data.list.map((item: ArticleItem) => ({
        id: item.article_id,
        title: item.title,
        image: item.Media[0]?.media_url || '',
    }));
};

onMounted(() => {
    getArticleCarouselList();
});

watch(
    () => route.params.id,
    (newId) => {
        if (newId) {
            getArticleCarouselList();
        }
    }
);
</script>

<style lang="scss" scoped>
.home-container {
    display: flex;
    flex-direction: column;
}

.content-row {
    display: flex;
    width: 1000px;
    margin: 0 auto;
    align-items: stretch;
}

.carousel {
    margin: 20px 0;
    margin-right: 20px;
    flex: 2;
    max-width: calc(1000px * (2 / 3));
    box-sizing: border-box;
}
.recommend {
    margin: 20px 0;
    padding-left: 20px;
    flex: 1;
    max-width: calc(1000px * (1 / 3));
    box-sizing: border-box;
    border-left: 1px solid #e0e0e0;
}
</style>
