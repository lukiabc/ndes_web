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
                        >
                        </el-avatar>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu class="user-dropdown-menu">
                            <div class="user-info">
                                <el-avatar
                                    :src="userStore.userInfo.result.avatar_url"
                                >
                                </el-avatar>
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
                            <el-dropdown-item
                                command="content"
                                class="menu-item"
                            >
                                <el-icon><Document /></el-icon>
                                <span>内容管理</span>
                            </el-dropdown-item>
                            <el-dropdown-item command="draft" class="menu-item">
                                <el-icon><Edit /></el-icon>
                                <span>草稿箱</span>
                            </el-dropdown-item>
                            <el-dropdown-item
                                command="favorites"
                                class="menu-item"
                            >
                                <el-icon><Star /></el-icon>
                                <span>我的收藏</span>
                            </el-dropdown-item>
                            <el-dropdown-item
                                command="history"
                                class="menu-item"
                            >
                                <el-icon><Clock /></el-icon>
                                <span>浏览历史</span>
                            </el-dropdown-item>
                            <el-dropdown-item
                                command="version"
                                class="menu-item"
                            >
                                <el-icon><Refresh /></el-icon>
                                <span>版本回溯</span>
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
            <el-main>
                <div class="view-container">
                    <router-view></router-view>
                </div>
            </el-main>
        </el-container>
    </el-container>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
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
const userStore = useUserStore();

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
    color: #000000;
    font-size: 20px;
    height: 60px;
    line-height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

    > div {
        display: flex;
        align-items: center;
    }
    .title {
        margin-left: 20px;
    }
}

.header-avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
}

.avatar-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
}

.el-divider {
    margin: 6px 0;
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
}

.el-aside {
    width: 150px !important;
    background-color: #a30800;
}

.el-menu {
    border: none;
    height: 100%;
    background-color: transparent !important;
}

.el-main {
    overflow: hidden;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-right: 20px;
}

.icon-title {
    display: flex;
    align-items: center;
    height: 35px;
    gap: 5px;
    color: #ffffff;
    cursor: pointer;
    font-size: 14px;
    background-color: #a30800;
    padding: 8px 10px;
    border-radius: 20px;
    outline: none;

    &:hover {
        background-color: #8b0600;
        transform: scale(1.02);
    }
}

.el-icon {
    font-size: 14px;
}
</style>

<style lang="scss">
.user-dropdown-menu {
    min-width: 200px !important;
    padding: 8px 0 !important;

    .el-divider {
        margin: 6px 0 !important;
    }

    .el-dropdown-menu__item {
        padding: 10px 16px !important;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: #333;
        white-space: nowrap;
    }
}
</style>
