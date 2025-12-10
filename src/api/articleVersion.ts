import httpInstance from '@/utils/http';

// 文章版本详情类型
export interface ArticleVersionItem {
    version_id: number;
    article_id: number;
    user_id: number;
    version_number: number;
    title: string;
    editor: string;
    content: string;
    created_at: string;
    article?: {
        article_id: number;
        title: string;
        status: '已发布' | '待审' | '草稿';
        total_versions: number;
    };
}

// 分页响应通用类型
interface PaginatedResponse<T> {
    total_versions: number;
    pagination: {
        current_page: number;
        page_size: number;
        total_items: number;
        total_pages: number;
    };
    versions: T[];
}

// 获取某篇文章的历史版本列表
export const getArticleVersionsAPI = (
    articleId: number,
    page = 1,
    limit = 20
) => {
    return httpInstance<PaginatedResponse<ArticleVersionItem>>({
        url: `/articleVersion/list/${articleId}`,
        method: 'GET',
        params: { page, limit },
    });
};

// 根据用户 ID 获取该用户编辑过的所有文章版本
export const getVersionsByUserAPI = (userId: number, page = 1, limit = 20) => {
    return httpInstance<
        PaginatedResponse<
            ArticleVersionItem & {
                article: NonNullable<ArticleVersionItem['article']>;
            }
        >
    >({
        url: `/articleVersion/user/${userId}`,
        method: 'GET',
        params: { page, limit },
    });
};

// 恢复到指定版本信息
export interface RevertVersionPayload {
    version_number: number;
    user_id: number;
    editor?: string;
}

// 恢复到指定版本
export const revertToVersionAPI = (
    articleId: number,
    payload: RevertVersionPayload
) => {
    return httpInstance({
        url: `/articleVersion/revert/${articleId}`,
        method: 'PUT',
        data: payload,
    });
};

// 获取指定版本的详细信息
export const getVersionDetailAPI = (versionId: number) => {
    return httpInstance<ArticleVersionItem>({
        url: `/articleVersion/${versionId}`,
        method: 'GET',
    });
};

// 文章最新版本信息
export interface LatestVersionResponse {
    article_id: number;
    latest_version: number;
    created_at: string;
}

// 获取文章的最新版本号
export const getLatestVersionAPI = (articleId: number) => {
    return httpInstance<LatestVersionResponse>({
        url: `/articleVersion/latest/${articleId}`,
        method: 'GET',
    });
};
