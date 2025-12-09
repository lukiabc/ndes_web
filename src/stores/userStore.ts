// stores/userStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { loginAPI } from '@/api/user';

export const useUserStore = defineStore(
    'user',
    () => {
        // 用户完整信息（包含 token）
        const userInfo = ref({
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
        });

        const isLogin = computed(() => {
            return !!userInfo.value.result.token;
        });

        const isAdmin = computed(() => {
            return isLogin.value && Number(userInfo.value.result.role_id) === 1;
        });

        const isUser = computed(() => {
            return isLogin.value && Number(userInfo.value.result.role_id) === 2;
        });

        // 登录
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

        // 登出
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
            // 可选：自定义存储 key 或 storage
            key: 'user-store',
            storage: localStorage,
        },
    }
);
