// 轮播图
import httpInstance from '@/utils/http';

interface Carousel {
    article_id: number;
    cover_image: string;
    title: string;
    sort_order: number;
    is_active: boolean;
    start_play_date?: string;
    end_play_date?: string;
}

// 获取启用的轮播图列表
export const getActiveCarouselsAPI = () => {
    return httpInstance({
        url: '/carousel/active',
        method: 'GET',
    });
};

// 获取轮播图列表
export const getCarouselsAPI = (page = 1, pageSize = 10) => {
    return httpInstance({
        url: '/carousel/list',
        method: 'GET',
        params: { page, pageSize },
    });
};

// 创建轮播图
export const createCarouselsAPI = (data: Carousel) => {
    return httpInstance({
        url: '/carousel/create',
        method: 'POST',
        data,
    });
};

// 更新轮播图
export const updateCarouselsAPI = (
    carousel_id: number,
    data: Partial<Carousel>
) => {
    return httpInstance({
        url: `/carousel/edit/${carousel_id}`,
        method: 'PUT',
        data,
    });
};

// 删除轮播图
export const deleteCarouselsAPI = (carousel_id: number) => {
    return httpInstance({
        url: `/carousel/delete/${carousel_id}`,
        method: 'DELETE',
    });
};
