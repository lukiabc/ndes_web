import httpInstance from '@/utils/http';

// 用户基础信息
export interface User {
    user_id: number;
    username: string;
    email: string;
    avatar_url?: string;
    role_id: number;
    status?: 'pending' | 'approved' | 'rejected';
    is_disabled?: boolean;
}

// 注册参数
export interface RegisterParams {
    username: string;
    password: string;
    email: string;
}

// 用户登录参数
export interface LoginParams {
    username: string;
    password: string;
    captcha: string; // 验证码内容
    captchaId: string; // 验证码唯一 ID
}

// 登录响应数据结构
export interface LoginResponse {
    userInfo: {
        code: number;
        msg: string;
        result: {
            user_id: number;
            username: string;
            email: string;
            role_id: number;
            avatar_url: string;
            token: string;
        };
    };
}

// 分页查询用户列表参数
export interface GetUserListParams {
    page?: number;
    pageSize?: number;
    keyword?: string;
}

// 分页响应结构
export interface UserListResponse {
    message: string;
    keyword: string | null;
    pagination: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
    users: User[];
}

// 审核操作参数
export interface ReviewParams {
    action: 'approved' | 'rejected';
}

// 用户登录
export const loginAPI = (data: LoginParams) => {
    return httpInstance({
        url: '/users/login',
        method: 'POST',
        data,
    });
};

// 用户注册
export const registerAPI = (data: RegisterParams) => {
    return httpInstance({
        url: '/users/register',
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
export const editUserInfoAPI = (
    userId: string,
    data: {
        username: string;
        email: string;
        avatar_url: string;
    }
) => {
    return httpInstance({
        url: `/users/update/${userId}`,
        method: 'PUT',
        data,
    });
};

// 获取用户列表（支持搜索）
export const getUserListAPI = (params?: GetUserListParams) => {
    return httpInstance<UserListResponse>({
        url: '/users/list',
        method: 'GET',
        params,
    });
};

// 获取待审核用户列表（需管理员权限）
export const getPendingUsersAPI = () => {
    return httpInstance<{
        users: User[];
    }>({
        url: '/users/pending',
        method: 'GET',
    });
};

// 审核用户（批准/拒绝）
export const reviewUserAPI = (userId: string | number, data: ReviewParams) => {
    return httpInstance({
        url: `/users/review/${userId}`,
        method: 'POST',
        data,
    });
};

// 禁用/启用用户
export const toggleUserDisableAPI = (
    userId: string | number,
    disable: boolean
) => {
    return httpInstance({
        url: `/users/disable/${userId}`,
        method: 'POST',
        data: { disable },
    });
};
