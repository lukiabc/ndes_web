<template>
    <el-container class="home-container">
        <el-header>
            <div>
                <span class="title">国防教育网站管理</span>
            </div>
            <div class="header-right">
                <el-dropdown
                    trigger="hover"
                    :show-arrow="false"
                    @command="handleCommand"
                >
                    <div class="avatar-wrapper">
                        <el-avatar
                            class="header-avatar"
                            :src="userStore.userInfo.result.avatar_url"
                        />
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu class="user-dropdown-menu">
                            <div class="user-info">
                                <el-avatar
                                    :src="userStore.userInfo.result.avatar_url"
                                />
                                <div class="user-name">
                                    {{ userStore.userInfo.result.username }}
                                </div>
                            </div>
                            <el-divider />
                            <el-dropdown-item
                                command="userInfo"
                                class="menu-item"
                            >
                                <el-icon><User /></el-icon>
                                <span>个人中心</span>
                            </el-dropdown-item>
                            <el-divider />
                            <el-dropdown-item
                                command="logout"
                                class="menu-item"
                            >
                                <el-icon><SwitchButton /></el-icon>
                                <span>退出</span>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <div class="icon-title" @click="openArticleCreate">
                    <el-icon><EditPen /></el-icon> 写文章
                </div>
            </div>
        </el-header>

        <el-container>
            <el-aside width="180px">
                <el-menu
                    active-text-color="#409EFF"
                    background-color="#ffffff"
                    text-color="#333"
                    :default-active="activeMenu"
                    style="border: none; height: 100%"
                    router
                >
                    <el-menu-item index="/user/content">
                        <el-icon><Document /></el-icon>
                        <span>内容管理</span>
                    </el-menu-item>
                    <el-menu-item index="/user/draft">
                        <el-icon><Edit /></el-icon>
                        <span>草稿箱</span>
                    </el-menu-item>
                    <!-- <el-menu-item index="/user/favorites">
                        <el-icon><Star /></el-icon>
                        <span>我的收藏</span>
                    </el-menu-item>
                    <el-menu-item index="/user/history">
                        <el-icon><Clock /></el-icon>
                        <span>浏览历史</span>
                    </el-menu-item> -->
                    <el-menu-item index="/user/ArticleVersionHistory">
                        <el-icon><Refresh /></el-icon>
                        <span>版本回溯</span>
                    </el-menu-item>
                </el-menu>
            </el-aside>

            <el-main>
                <div class="view-container">
                    <router-view />
                </div>
            </el-main>
        </el-container>
    </el-container>
</template>

<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router';
import {
    User,
    Document,
    Edit,
    EditPen,
    Star,
    Clock,
    Refresh,
    SwitchButton,
} from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const activeMenu = computed(() => {
    return route.path;
});

const handleCommand = (command: string) => {
    if (command === 'logout') {
        userStore.clearUserInfo();
        router.push('/login');
    } else if (command === 'userInfo') {
        router.push('/userInfo');
    }
};

const openArticleCreate = () => {
    const url = router.resolve('/article/create').href;
    window.open(url, '_blank');
};
</script>

<style lang="scss" scoped>
.home-container {
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.el-header {
    background-color: #ffffff;
    color: #333;
    font-size: 20px;
    height: 60px;
    line-height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
    z-index: 100;

    > div {
        display: flex;
        align-items: center;
    }

    .title {
        margin-left: 24px;
        font-weight: 600;
        color: #a30800;
    }
}

.header-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
    transition: transform 0.2s ease;
    &:hover {
        transform: scale(1.05);
    }
}

.avatar-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    font-weight: 500;
}

.user-name {
    font-size: 14px;
}

.el-container {
    flex: 1;
    display: flex;
    min-height: 0;
}

.el-aside {
    width: 200px !important;
    background-color: #fff;
    border-right: 1px solid #eee;
    box-shadow: 2px 0 6px rgba(0, 0, 0, 0.03);
}

.el-menu {
    border: none !important;
    height: 100%;
    background-color: #fff !important;
    padding-top: 12px;
}

:deep(.el-menu-item) {
    height: 48px;
    line-height: 48px;
    margin: 4px 0;
    padding-left: 24px !important;
    border-radius: 0 20px 20px 0 !important;
    transition: all 0.2s ease;

    &:hover {
        background-color: #f5f7fa !important;
    }

    &.is-active {
        background-color: #eef5ff !important;
        color: #409eff !important;
        font-weight: 600;
    }

    .el-icon {
        margin-right: 10px;
        width: 18px;
        text-align: center;
    }
}

.el-main {
    background-color: #f9fafc;
    padding: 20px;
    overflow-y: auto;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-right: 24px;
}

.icon-title {
    display: flex;
    align-items: center;
    height: 36px;
    gap: 6px;
    color: #ffffff;
    cursor: pointer;
    font-size: 14px;
    background-color: #a30800;
    padding: 0 16px;
    border-radius: 20px;
    outline: none;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(163, 8, 0, 0.2);

    &:hover {
        background-color: #8b0600;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(163, 8, 0, 0.3);
    }

    .el-icon {
        font-size: 16px;
    }
}
</style>

<style lang="scss">
.user-dropdown-menu {
    min-width: 200px !important;
    padding: 8px 0 !important;
    border: 1px solid #eee;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .el-divider {
        margin: 6px 0 !important;
    }

    .el-dropdown-menu__item {
        padding: 10px 16px !important;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: #444;
        white-space: nowrap;
        transition: background-color 0.2s;

        &:hover {
            background-color: #f5f7fa;
            color: #409eff;
        }

        .el-icon {
            font-size: 16px;
            color: #666;
        }
    }
}

.user-info {
    padding: 12px 16px !important;
    background-color: #f9fafc;
    .user-name {
        font-size: 14px;
        font-weight: 600;
        color: #333;
    }
}
</style>
