import { defineStore } from 'pinia';
import { loginAPI } from '@/api/user';

export const useUserStore = defineStore(
    'user',
    () => {
        const userInfo = ref({
            code: 0,
            msg: '',
            result: {
                user_id: '',
                username: '',
                password: '',
                email: '',
                role_id: '',
                avatar_url: '',
                token: '',
            },
        });

        const getUserInfo = async ({
            username,
            password,
        }: {
            username: string;
            password: string;
        }) => {
            const res = await loginAPI({ username, password });
            userInfo.value = res.data.userInfo;
        };

        // 清除用户信息
        const clearUserInfo = () => {
            userInfo.value = {
                code: 0,
                msg: '',
                result: {
                    user_id: '',
                    username: '',
                    password: '',
                    email: '',
                    role_id: '',
                    avatar_url: '',
                    token: '',
                },
            };
        };

        return {
            userInfo,
            getUserInfo,
            clearUserInfo,
        };
    },
    {
        persist: true,
    }
);
