<template>
    <div>
        <table class="user-table">
            <thead>
                <tr>
                    <th width="100">账号</th>
                    <th width="100">头像</th>
                    <th width="100">用户名</th>
                    <th width="100">邮箱</th>
                    <th width="100">操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in userList" :key="item.user_id">
                    <td>{{ item.user_id }}</td>
                    <td>
                        <img
                            :src="item.avatar_url"
                            alt="avatar"
                            style="width: 50px; height: 50px"
                        />
                    </td>
                    <td>{{ item.username }}</td>
                    <td>{{ item.email }}</td>
                    <td>
                        <span
                            @click="openDetailModal(item.user_id)"
                            class="detail-link"
                            >详情</span
                        >
                    </td>
                </tr>
                <tr v-if="userList.length === 0">
                    <td colspan="5">
                        <div class="empty-table">
                            <el-empty description="用户列表为空"> </el-empty>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <pop-window
            :isOpen="isDetailModalVisible"
            title="用户详情"
            bgColor="white"
            width="400px"
            height="500px"
            :showFooter="false"
            @close="closeDetailModal"
        >
            <FromModule
                :formList="detailFormList"
                :editItem="userInfo"
                :showFooter="false"
                mode="detail"
            />
        </pop-window>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getUserListApI, getUserInfoAPI } from '@/api/user';
import FromModule from '@/components/FromModule.vue';
import PopWindow from '@/components/PopWindow.vue';

interface User {
    user_id: number;
    username: string;
    avatar_url: string;
    email: string;
}

const userList = ref<User[]>([]);
const userInfo = ref<User>();

const isDetailModalVisible = ref(false);

// 详情表单列表
const detailFormList = [
    {
        name: 'avatar_url',
        label: '头像',
        type: 'file',
        disabled: true,
    },
    {
        name: 'user_id',
        label: '账号',
        type: 'text',
        disabled: true,
    },

    {
        name: 'username',
        label: '用户名',
        type: 'text',
        disabled: true,
    },
    {
        name: 'email',
        label: '邮箱',
        type: 'text',
        disabled: true,
    },
];

onMounted(async () => {
    try {
        const res = await getUserListApI();
        userList.value = res.data.users;
    } catch (error) {
        console.error('获取用户列表失败:', error);
    }
});

// 打开详情弹框
const openDetailModal = async (userId: number) => {
    isDetailModalVisible.value = true;
    const res = await getUserInfoAPI(userId.toString());
    userInfo.value = res.data;
    console.log(userInfo.value);
};

// 关闭弹框
const closeDetailModal = () => {
    isDetailModalVisible.value = false;
};
</script>

<style lang="scss" scoped>
.user-table {
    width: 100%;
    border-collapse: collapse;
    background-color: #ffffff;
    th,
    td {
        border: 1px solid #ebeef5;
        padding: 10px;
        text-align: left;
        font-size: 14px; // 设置字号为14px
    }
    th {
        background-color: #f5f7fa;
    }
    .empty-table {
        text-align: center;
        padding: 20px;
    }
    .random-browse {
        color: #409eff;
        text-decoration: none;
    }
    .detail-link {
        cursor: pointer;
        &:hover {
            text-decoration: underline;
        }
    }
}
</style>
