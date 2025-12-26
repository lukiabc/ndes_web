import { defineStore } from 'pinia';
import { loginAPI } from '@/api/user';

interface UserInfo {
    code: number;
    msg: string;
    result: {
        user_id: string;
        username: string;
        email: string;
        role_id: number;
        avatar_url: string;
        token: string;
        updated_at?: string;
    };
}

export const useUserStore = defineStore(
    'user',
    () => {
        const userInfo = ref<UserInfo>({
            code: 0,
            msg: '',
            result: {
                user_id: '',
                username: '',
                email: '',
                role_id: 0,
                avatar_url: '',
                token: '',
                updated_at: '',
            },
        });

        const isLogin = computed(() => !!userInfo.value.result.token);
        const isAdmin = computed(
            () => isLogin.value && userInfo.value.result.role_id === 1
        );
        const isUser = computed(
            () => isLogin.value && userInfo.value.result.role_id === 2
        );

        const getUserInfo = async ({
            username,
            password,
            captcha,
            captchaId,
        }: {
            username: string;
            password: string;
            captcha: string;
            captchaId: string;
        }) => {
            const res = await loginAPI({
                username,
                password,
                captcha,
                captchaId,
            });

            // 确保 res.data.userInfo 是正确的结构
            if (res.data && res.data.userInfo) {
                userInfo.value = res.data.userInfo;
            } else {
                throw new Error('登录响应格式错误');
            }
        };

        const clearUserInfo = () => {
            userInfo.value = {
                code: 0,
                msg: '',
                result: {
                    user_id: '',
                    username: '',
                    email: '',
                    role_id: 0,
                    avatar_url: '',
                    token: '',
                },
            };
        };

        return {
            userInfo,
            isLogin,
            isAdmin,
            isUser,
            getUserInfo,
            clearUserInfo,
        };
    },
    {
        persist: {
            key: 'user-store',
            storage: localStorage,
        },
    }
);
