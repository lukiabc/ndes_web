import router from '@/router';
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const httpInstance = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 50000,
});

// 添加请求拦截器
httpInstance.interceptors.request.use(
    function (config) {
        // 在发送请求之前做些什么
        const userStore = useUserStore();
        const token = userStore.userInfo.result?.token;
        if (token) {
            // 将 token 放在请求头
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    function (error) {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);

// 添加响应拦截器
httpInstance.interceptors.response.use(
    function (response) {
        // 对响应数据做些什么
        return response;
    },
    function (error) {
        ElMessage.warning(error.response.data.message);

        // 401 未授权错误，清除用户信息
        if (error.response.status === 401) {
            useUserStore().clearUserInfo;
            router.push('/login');
        }
        return Promise.reject(error);
    }
);

export default httpInstance;
