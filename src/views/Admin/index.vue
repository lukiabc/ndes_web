<template>
    <el-container class="home-container">
        <el-header>
            <div>
                <span>国防教育网站管理</span>
            </div>
            <div class="header-right">
                <el-dropdown trigger="click" @command="handleCommand">
                    <div class="seting">
                        <el-icon><Setting /></el-icon>设置
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="userInfo"
                                >个人中心</el-dropdown-item
                            >
                            <el-dropdown-item command="logout"
                                >退出系统</el-dropdown-item
                            >
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </el-header>

        <el-container>
            <el-aside width="150px">
                <el-menu
                    active-text-color="#ffd04b"
                    background-color="#a30800"
                    class="el-menu-vertical-demo"
                    default-active="2"
                    text-color="#fff"
                    style="min-height: 780px"
                    @open="handleOpen"
                    @close="handleClose"
                    router
                >
                    <el-sub-menu index="1">
                        <template #title>
                            <span>用户管理</span>
                        </template>
                        <el-menu-item index="/admin/userList"
                            >用户列表</el-menu-item
                        >
                    </el-sub-menu>

                    <el-sub-menu index="2">
                        <template #title>
                            <span>分类管理</span>
                        </template>
                        <el-menu-item index="/admin/categoryList"
                            >分类列表</el-menu-item
                        >
                    </el-sub-menu>

                    <el-sub-menu index="3">
                        <template #title>
                            <span>文章管理</span>
                        </template>
                        <el-menu-item index="/admin/articleList"
                            >文章列表</el-menu-item
                        >
                    </el-sub-menu>

                    <el-sub-menu index="4">
                        <template #title>
                            <span>敏感词管理</span>
                        </template>
                        <el-menu-item index="/admin/sensitiveWordList"
                            >敏感词列表</el-menu-item
                        >
                    </el-sub-menu>

                    <el-sub-menu index="5">
                        <template #title>
                            <span>审核管理</span>
                        </template>
                        <el-menu-item index="/admin/nocourse"
                            >文章审核</el-menu-item
                        >
                        <el-menu-item index="/admin/yescourse"
                            >审核记录</el-menu-item
                        >
                    </el-sub-menu>
                </el-menu>
            </el-aside>
            <el-main>
                <div class="main-container">
                    <router-view></router-view>
                </div>
            </el-main>
        </el-container>
    </el-container>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { Setting } from '@element-plus/icons-vue';
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

const handleOpen = (key: string, keyPath: string[]) => {
    console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
    console.log(key, keyPath);
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
    background-color: #a30800;
    color: #fff;
    font-size: 20px;
    height: 60px;
    line-height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;

    > div {
        display: flex;
        align-items: center;
        span {
            margin-left: 15px;
        }
    }
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
    background-color: #eaedf1;
    height: calc(100vh - 60px);
    overflow: hidden;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 10px;
}

.seting {
    display: flex;
    align-items: center;
    gap: 5px;
    color: white;
    cursor: pointer;
}

.el-icon {
    font-size: 20px;
}
</style>
