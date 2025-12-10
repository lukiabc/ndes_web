import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { ElMessage } from 'element-plus';

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
            redirect: '/admin/userList',
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
                {
                    path: 'reviewRecords',
                    name: 'reviewRecords',
                    component: () => import('@/views/Admin/reviewRecords.vue'),
                },
                {
                    path: 'carouselList',
                    name: 'carouselList',
                    component: () => import('@/views/Admin/carouselList.vue'),
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
            redirect: '/user/content',
            component: () => import('@/views/User/userIndex.vue'),
            children: [
                {
                    path: 'content',
                    name: 'content',
                    component: () => import('@/views/User/content.vue'),
                },
                {
                    path: 'draft',
                    name: 'draft',
                    component: () => import('@/views/User/draft.vue'),
                },
                {
                    path: 'ArticleVersionHistory',
                    name: 'ArticleVersionHistory',
                    component: () =>
                        import('@/views/User/ArticleVersionHistory.vue'),
                },
            ],
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

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();

    // 允许任何人访问 /login
    if (to.path === '/login') {
        return next(); // 直接放行！
    }

    // 保护 /admin 和 /user 路由：未登录则跳转到登录页
    if (
        (to.path.startsWith('/admin') || to.path.startsWith('/user')) &&
        !userStore.isLogin
    ) {
        ElMessage.warning('请先登录');
        return next('/login');
    }

    // 权限校验：防止普通用户进 admin 管理员进 user
    if (to.path.startsWith('/admin') && !userStore.isAdmin) {
        ElMessage.error('您没有管理员权限');
        return next(from.path || '/');
    }

    if (to.path.startsWith('/user') && !userStore.isUser) {
        ElMessage.error('您不是普通用户');
        return next(from.path || '/');
    }

    // 其他放行
    next();
});

export default router;
