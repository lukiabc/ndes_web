import httpInstance from '@/utils/http';

export interface ReviewSubmitData {
    reviewer: number;
    review_result: '通过' | '拒绝' | '退回修订';
    review_comments: string;
}

export interface ReviewRecord {
    review_id: number;
    article_id: number;
    reviewer: number;
    review_result: '通过' | '拒绝' | '退回修订';
    review_comments: string | null;
    review_time: string;
    Article: {
        title: string;
    };
    Reviewer: {
        username: string;
    };
}

export interface ReviewListQuery {
    page?: number;
    pageSize?: number;
    article_title?: string;
    article_id?: number;
    review_result?: '通过' | '拒绝' | '退回修订';
    reviewer_id?: number;
}

// 审核
export const reviewArticleAPI = (articleId: number, data: ReviewSubmitData) => {
    return httpInstance({
        url: `/reviews/${articleId}`,
        method: 'POST',
        data,
    });
};

// 获取审核记录列表
export const getReviewRecordsListAPI = (params?: ReviewListQuery) => {
    return httpInstance({
        url: '/reviews/recordsList',
        method: 'GET',
        params,
    });
};
