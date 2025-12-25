import httpInstance from '@/utils/http';

interface user {
    username: string;
    password: string;
    email: string;
    avatar?: string;
}

// 用户登录参数
interface LoginParams {
    username: string;
    password: string;
    captcha: string; // 验证码内容
    captchaId: string; // 验证码唯一ID
}

// 用户登录
export const loginAPI = (data: LoginParams) => {
    return httpInstance({
        url: '/users/login',
        method: 'POST',
        data,
    });
};

// 获取用户详情信息
export const getUserInfoAPI = (userId: string) => {
    return httpInstance({
        url: `/users/details/${userId}`,
        method: 'GET',
    });
};

// 编辑用户信息
export const editUserInfoAPI = (userId: string, data: user) => {
    return httpInstance({
        url: `/users/update/${userId}`,
        method: 'PUT',
        data,
    });
};

// 获取用户列表
export const getUserListApI = () => {
    return httpInstance({
        url: '/users/list',
        method: 'GET',
    });
};
