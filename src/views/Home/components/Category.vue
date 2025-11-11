<template>
    <div class="container">
        <div class="content" v-for="c in categoryList">
            <div class="title-box">
                <span class="title">{{ c.category_name }}</span>
                <router-link :to="`/category/sub/${c.category_id}`" class="more"
                    >更多 >></router-link
                >
            </div>
            <div class="image-box">
                <router-link :to="`/article/${c.articles[0].article_id}`">
                    <img
                        v-if="c.articles && c.articles[0]?.Media?.[0]"
                        :src="c.articles[0].Media[0].media_url"
                        :alt="c.articles[0].title"
                    />
                    <img v-else src="@/assets/images/login.png" alt="默认图" />
                </router-link>
            </div>
            <router-link :to="`/article/${c.articles[0].article_id}`">
                <span class="image-title ellipsis">{{
                    c.articles[0]?.title || '默认标题'
                }}</span>
            </router-link>

            <div class="list-box">
                <span
                    v-for="article in (c.articles || []).slice(1, 4)"
                    :key="article.article_id"
                    class="title-list ellipsis"
                >
                    <router-link :to="`/article/${article.article_id}`">
                        {{ article.title }}
                    </router-link>
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {
    getArticlesByParentCategoryAPI,
    type ArticleItem,
} from '@/api/article';
import { getCategoryListAPI, type CategoryItem } from '@/api/category';

// 扩展类型：让分类包含自己的文章
interface CategoryWithArticles extends CategoryItem {
    articles: ArticleItem[];
}
const categoryList = ref<CategoryWithArticles[]>([]);

// 分类列表
const getCategoryList = async () => {
    try {
        const res = await getCategoryListAPI();
        const topCategories = res.data
            .filter((item: any) => item.parent_id === null)
            .slice(1);

        // 使用 Promise.all 并行加载每个分类的文章
        const categoriesWithArticles = await Promise.all(
            topCategories.map(async (c: CategoryItem) => {
                try {
                    const articleRes = await getArticlesByParentCategoryAPI(
                        c.category_id
                    );
                    const publishedArticles = (
                        articleRes.data.list || []
                    ).filter(
                        (article: ArticleItem) => article.status === '已发布'
                    );

                    return {
                        ...c,
                        articles: publishedArticles,
                    };
                } catch (err) {
                    console.warn(`加载分类 ${c.category_name} 的文章失败`, err);
                    return { ...c, articles: [] };
                }
            })
        );

        categoryList.value = categoriesWithArticles;
    } catch (err) {
        console.error('获取分类列表失败', err);
    }
};

onMounted(() => {
    getCategoryList();
});
</script>

<style lang="scss" scoped>
.container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    width: 1200px;
    margin: 0 auto;
    font-size: 14px;
}

.more {
    color: #0056b3;
    text-decoration: none;
    font-size: 14px;
}

.title-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #e0e0e0;
}

.image-title {
    display: block;
    font-size: 14px;
    font-weight: bold;
    color: #333;
}

.title {
    padding: 5px 12px;
    font-size: 16px;
    color: #0056b3;
    font-weight: bold;
    border-bottom: 2px solid #0056b3;
    margin-bottom: -2px;
}

.image-box {
    margin-bottom: 10px;
}

.image-box img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 4px;
}

.list-box {
    display: flex;
    flex-direction: column;
    span {
        margin-top: 5px;
    }
}

:deep(a) {
    color: inherit;
    text-decoration: none;
}

:deep(a:hover) {
    color: #0056b3;
    text-decoration: none;
}
</style>
