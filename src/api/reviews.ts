import httpInstance from '@/utils/http';

// 获取谋篇文章的所有审核记录
export const getReviewsAPI = (articleId: number) => {
    return httpInstance({
        url: `/reviews/query/${articleId}`,
        method: 'GET',
    });
};

// 审核
export const reviewArticleAPI = (
    articleId: number,
    data: {
        reviewer: number;
        review_result: '通过' | '拒绝' | '退回修订';
        review_comments?: string;
    }
) => {
    return httpInstance({
        url: `/reviews/${articleId}`,
        method: 'POST',
        data,
    });
};

// 模糊搜索“待审”状态的文章（标题或内容）
export const searchPendingArticlesAPI = (
    keyword: string,
    page: number = 1,
    pageSize: number = 10
) => {
    return httpInstance({
        url: '/article/pending/search',
        method: 'GET',
        params: {
            keyword,
            page,
            pageSize,
        },
    });
};
