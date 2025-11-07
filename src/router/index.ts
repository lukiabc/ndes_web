import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/Login/index.vue'),
        },
        {
            path: '/',
            name: 'layout',
            component: () => import('@/views/Layout/layoutIndex.vue'),
            children: [
                {
                    path: '',
                    name: 'home',
                    component: () => import('@/views/Home/index.vue'),
                },
                {
                    path: 'category/:id',
                    name: 'category',
                    component: () =>
                        import('@/views/Home/Category/categoryIndex.vue'),
                },
                {
                    path: 'category/sub/:id',
                    name: 'subCategory',
                    component: () =>
                        import('@/views/Home/Category/subCategoryIndex.vue'),
                },
            ],
        },
        {
            path: '/admin',
            name: 'admin',
            component: () => import('@/views/Admin/index.vue'),
            children: [
                {
                    path: 'userList',
                    name: 'userList',
                    component: () => import('@/views/Admin/userList.vue'),
                },
                {
                    path: 'categoryList',
                    name: 'categoryList',
                    component: () => import('@/views/Admin/categoryList.vue'),
                },
                {
                    path: 'sensitiveWordList',
                    name: 'sensitiveWordList',
                    component: () =>
                        import('@/views/Admin/sensitiveWordList.vue'),
                },
                {
                    path: 'articleList',
                    name: 'articleList',
                    component: () => import('@/views/Admin/articleList.vue'),
                },
            ],
        },
        {
            path: '/userInfo',
            name: 'userInfo',
            component: () => import('@/views/User/userInfo.vue'),
        },
        {
            path: '/articleDetail/:id',
            name: 'articleDetail',
            component: () => import('@/views/Admin/articleDetail.vue'),
        },
    ],
});

export default router;
