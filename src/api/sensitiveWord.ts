import httpInstance from '@/utils/http';

// 创建敏感词
export const createSensitiveWordAPI = (
    word: string,
    type: string = 'keyword'
) => {
    return httpInstance({
        url: '/sensitive/create',
        method: 'POST',
        data: {
            word,
            type,
        },
    });
};

// 删除敏感词
export const deleteSensitiveWordAPI = (id: string) => {
    return httpInstance({
        url: `/sensitive/delete/${id}`,
        method: 'DELETE',
    });
};

// 获取敏感词列表
export const getSensitiveWordListAPI = (page = 1, pageSize = 10) => {
    return httpInstance({
        url: '/sensitive/list',
        method: 'GET',
        params: { page, pageSize },
    });
};

// 编辑敏感词
export const updateSensitiveWordAPI = (
    id: string,
    word: string,
    type: string = 'keyword'
) => {
    return httpInstance({
        url: `/sensitive/update/${id}`,
        method: 'PUT',
        data: {
            word,
            type,
        },
    });
};

// 模糊查询敏感词
export const searchSensitiveWordsAPI = (
    word: string,
    page: number = 1,
    pageSize: number = 10
) => {
    return httpInstance({
        url: '/sensitive/search',
        method: 'GET',
        params: {
            q: word,
            page,
            pageSize,
        },
    });
};
