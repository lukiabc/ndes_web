import httpInstance from '@/utils/http';

export interface ReviewSubmitData {
    reviewer: number;
    review_result: '通过' | '拒绝' | '退回修订';
    review_comments?: string; // 可选
}

// 获取谋篇文章的所有审核记录
export const getReviewsAPI = (articleId: number) => {
    return httpInstance({
        url: `/reviews/query/${articleId}`,
        method: 'GET',
    });
};

// 审核
export const reviewArticleAPI = (articleId: number, data: ReviewSubmitData) => {
    return httpInstance({
        url: `/reviews/${articleId}`,
        method: 'POST',
        data,
    });
};
