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
                    {{ extractFirstParagraph(item.content) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import {
    getArticlesByParentCategoryAPI,
    type ArticleItem,
} from '@/api/article';

const route = useRoute();
const recommendList = ref<ArticleItem[]>([]);
const currentCategoryId = Number(route.params.id);

// 提取 html 第一段内容
const extractFirstParagraph = (htmlContent: string | null): string => {
    if (!htmlContent) return '暂无描述';

    // 创建一个临时 div 来解析 HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // 找到第一个 <p> 标签
    const firstP = tempDiv.querySelector('p');
    if (firstP) {
        // 获取纯文本并去除首尾空白
        let text = firstP.textContent?.trim() || '';
        // 可选：截断到 80 个字符，避免太长
        if (text.length > 80) {
            text = text.substring(0, 80) + '...';
        }
        return text;
    }

    // 如果没有 <p>，尝试返回整个内容的纯文本（降级）
    const allText = tempDiv.textContent?.trim() || '暂无描述';
    return allText.length > 80 ? allText.substring(0, 80) + '...' : allText;
};

// 推荐数据
const getRecommendList = async () => {
    const res = await getArticlesByParentCategoryAPI(currentCategoryId, 1, 10);
    recommendList.value = res.data.list || [];
};

onMounted(() => {
    getRecommendList();
});
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
