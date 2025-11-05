import httpInstance from '@/utils/http';

interface Category {
    category_name: string;
    parent_id: number | null;
}

// 模糊查询分类
export const searchCategoriesAPI = (
    category_name: string,
    page: number = 1,
    pageSize: number = 10
) => {
    return httpInstance({
        url: `/categories/search?category_name=${encodeURIComponent(
            category_name
        )}&page=${page}&pageSize=${pageSize}`,
        method: 'GET',
    });
};

// 获取分类列表
export const getCategoryListAPI = () => {
    return httpInstance({
        url: '/categories/list',
        method: 'GET',
    });
};

// 创建分类
export const createCategoryAPI = (data: Category) => {
    return httpInstance({
        url: '/categories/create',
        method: 'POST',
        data,
    });
};

//更新分类
export const updateCategoryAPI = (category_id: string, data: Category) => {
    return httpInstance({
        url: `/categories/update/${category_id}`,
        method: 'PUT',
        data,
    });
};

// 删除子分类
export const deleteCategoryAPI = (category_id: string) => {
    return httpInstance({
        url: `/categories/delete/${category_id}`,
        method: 'DELETE',
    });
};

// 删除分类及其子分类
export const deleteCategoryAndChildrenAPI = (category_id: string) => {
    return httpInstance({
        url: `/categories/deleteAll/${category_id}`,
        method: 'DELETE',
    });
};
