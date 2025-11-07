import httpInstance from '@/utils/http';

// 定义分类结构（支持嵌套）
interface Category {
    category_id: number;
    category_name: string;
    ParentCategory?: {
        category_id: number;
        category_name: string;
    };
}

// 文章类型定义
export interface ArticleItem {
    article_id: number;
    title: string;
    content: string;
    publish_date?: string;
    status: '已发布' | '待审' | '草稿';
    source?: string;
    editor?: string;
    category_id: number;
    Category: Category;
    Media: Array<{
        media_id: number;
        media_type: string;
        media_url: string;
        description: string;
    }>;
}

// 分页响应类型
interface PaginatedResponse<T> {
    total: number;
    page: number;
    pageSize: number;
    list: T[];
}

// 全文检索结果
export interface SearchResponse {
    total: number;
    page: number;
    pageSize: number;
    keyword: string;
    sensitive_hit: boolean; // 是否命中敏感词
    list: Array<
        Omit<ArticleItem, 'content'> & {
            content: string; // 已高亮
            title: string; // 已高亮
            score: number; // 相关性得分
        }
    >;
}

// 获取所有文章列表
export const getArticleListAPI = (page = 1, pageSize = 10) => {
    return httpInstance<PaginatedResponse<ArticleItem>>({
        url: '/article/list',
        method: 'GET',
        params: { page, pageSize },
    });
};

// 根据子分类 ID 获取文章列表
export const getArticlesByCategoryAPI = (
    categoryId: number,
    page = 1,
    pageSize = 10
) => {
    return httpInstance<PaginatedResponse<ArticleItem>>({
        url: `/article/list/${categoryId}`,
        method: 'GET',
        params: { page, pageSize },
    });
};

export const getArticlesByParentCategoryAPI = (
    parentId: number,
    page = 1,
    pageSize = 10
) => {
    return httpInstance<PaginatedResponse<ArticleItem>>({
        url: `/article/listByParent/${parentId}`,
        method: 'GET',
        params: { page, pageSize },
    });
};
// 按状态查询文章
export const getArticlesByStatus = (
    status: string,
    page = 1,
    pageSize = 10
) => {
    return httpInstance.get(`/article/status/${status}`, {
        params: { page, pageSize },
    });
};

// 获取文章详情
export const getArticleDetailAPI = (articleId: number) => {
    return httpInstance<ArticleItem>({
        url: `/article/details/${articleId}`,
        method: 'GET',
    });
};

// 全文检索文章
export const searchArticlesAPI = (
    words: string,
    page = 1,
    pageSize = 10,
    status?: 'published' // 可选：只查已发布
) => {
    return httpInstance<SearchResponse>({
        url: '/article/searchAll',
        method: 'GET',
        params: {
            words,
            page,
            pageSize,
            ...(status ? { status } : {}), // 动态添加 status 参数
        },
    });
};

// 创建文章（投稿或存草稿）
export const createArticleAPI = (
    formData: FormData,
    as: 'submit' | 'draft' = 'submit'
) => {
    return httpInstance({
        url: `/article/create?as=${as}`,
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        data: formData,
    });
};

// 编辑文章
export const editArticleAPI = (
    articleId: number | string,
    formData: FormData
) => {
    return httpInstance({
        url: `/article/edit/${articleId}`,
        method: 'PUT',
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        data: formData,
    });
};

// 删除文章
export const deleteArticleAPI = (articleId: number | string) => {
    return httpInstance({
        url: `/article/delete/${articleId}`,
        method: 'DELETE',
    });
};
