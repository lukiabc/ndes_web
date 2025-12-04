import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
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
                        import('@/views/Layout/Category/categoryIndex.vue'),
                },
                {
                    path: 'category/sub/:id',
                    name: 'subCategory',
                    component: () =>
                        import('@/views/Layout/Category/subCategoryIndex.vue'),
                },
                {
                    path: 'article/:id',
                    name: 'articleDetailFront',
                    component: () =>
                        import('@/views/Article/articleDetail.vue'),
                },
                {
                    path: '/search',
                    name: 'search',
                    component: () =>
                        import('@/views/Layout/components/SearchAll.vue'),
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
                {
                    path: 'reviewArticle',
                    name: 'reviewArticleList',
                    component: () => import('@/views/Admin/reviewArticle.vue'),
                },
            ],
        },
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/Login/index.vue'),
        },
        {
            path: '/userInfo',
            name: 'userInfo',
            component: () => import('@/views/User/userInfo.vue'),
        },
        {
            path: '/user',
            name: 'user',
            component: () => import('@/views/User/userIndex.vue'),
            children: [],
        },
        {
            path: '/articleDetail/:id',
            name: 'articleDetailAdmin',
            component: () => import('@/views/Article/articleDetail.vue'),
        },
        {
            path: '/article/create',
            name: 'createArticle',
            component: () => import('@/views/Article/article.vue'),
            props: { mode: 'create' },
        },
        {
            path: '/article/edit/:id',
            name: 'editArticle',
            component: () => import('@/views/Article/article.vue'),
            props: true,
        },
    ],
});

export default router;
