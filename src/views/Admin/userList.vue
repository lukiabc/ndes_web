<template>
    <div class="user-list">
        <!-- 视图模式切换 -->
        <el-radio-group v-model="viewMode" size="small" class="view-mode-radio">
            <el-radio-button label="all">全部用户</el-radio-button>
            <el-radio-button label="pending">待审核</el-radio-button>
        </el-radio-group>

        <!-- 搜索表单（仅在“全部用户”模式下显示） -->
        <el-form
            v-if="viewMode === 'all'"
            :inline="true"
            class="search-form"
            @submit.prevent
        >
            <el-form-item label="关键词">
                <el-input
                    v-model="searchForm.keyword"
                    placeholder="用户名/邮箱"
                    clearable
                    @input="debouncedSearch"
                    style="width: 200px"
                />
            </el-form-item>
        </el-form>

        <!-- 用户表格 -->
        <el-table
            :data="userList"
            style="width: 100%"
            border
            :loading="loading"
            empty-text="暂无用户"
        >
            <el-table-column prop="user_id" label="账号" width="100" sortable />

            <el-table-column label="头像" width="90">
                <template #default="scope">
                    <el-avatar
                        :src="
                            scope.row.avatar_url ||
                            'http://localhost:3000/uploads/kk.jpg'
                        "
                        :size="60"
                        shape="square"
                    />
                </template>
            </el-table-column>

            <el-table-column
                prop="username"
                label="用户名"
                min-width="120"
                sortable
            >
                <template #default="scope">
                    <span
                        v-html="
                            highlightText(
                                scope.row.username,
                                searchForm.keyword
                            )
                        "
                    />
                </template>
            </el-table-column>

            <el-table-column prop="email" label="邮箱" min-width="180" sortable>
                <template #default="scope">
                    <span
                        v-html="
                            highlightText(scope.row.email, searchForm.keyword)
                        "
                    />
                </template>
            </el-table-column>

            <!-- 状态列 -->
            <el-table-column v-if="viewMode === 'all'" label="状态" width="100">
                <template #default="scope">
                    <el-tag
                        v-if="scope.row.status === 'pending'"
                        type="warning"
                    >
                        待审核
                    </el-tag>
                    <el-tag v-else-if="scope.row.is_disabled" type="danger">
                        已禁用
                    </el-tag>
                    <el-tag v-else type="success"> 正常 </el-tag>
                </template>
            </el-table-column>

            <el-table-column label="操作" min-width="220">
                <template #default="scope">
                    <!-- 详情按钮始终显示 -->
                    <el-button
                        size="small"
                        type="primary"
                        @click="openDetailModal(scope.row)"
                    >
                        详情
                    </el-button>

                    <!-- 审核按钮：仅在待审核模式下显示 -->
                    <template v-if="viewMode === 'pending'">
                        <el-button
                            size="small"
                            type="success"
                            @click="handleReview(scope.row, 'approved')"
                            style="margin-left: 6px"
                        >
                            批准
                        </el-button>
                        <el-button
                            size="small"
                            type="danger"
                            @click="handleReview(scope.row, 'rejected')"
                            style="margin-left: 6px"
                        >
                            拒绝
                        </el-button>
                    </template>

                    <!-- 禁用/解禁按钮 -->
                    <template
                        v-if="viewMode === 'all' && scope.row.role_id !== 1"
                    >
                        <el-button
                            size="small"
                            :type="
                                scope.row.is_disabled ? 'success' : 'warning'
                            "
                            @click="handleToggleDisable(scope.row)"
                            style="margin-left: 6px"
                        >
                            {{ scope.row.is_disabled ? '解禁' : '禁用' }}
                        </el-button>
                    </template>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页（仅在“全部用户”模式下显示） -->
        <el-pagination
            v-if="viewMode === 'all'"
            class="pagination"
            background
            layout="total, prev, pager, next, sizes, jumper"
            :total="total"
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            size="small"
            :page-sizes="[10, 20, 30, 40, 50]"
            @size-change="loadUsers"
            @current-change="loadUsers"
        />
    </div>

    <!-- 用户详情弹窗 -->
    <PopWindow
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
            :editItem="selectedUser"
            :showFooter="false"
            mode="detail"
        />
    </PopWindow>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { highlightText } from '@/utils/highlightText';
import {
    getUserListAPI,
    getPendingUsersAPI,
    reviewUserAPI,
    toggleUserDisableAPI,
    type User,
} from '@/api/user';
import FromModule from '@/components/FromModule.vue';
import PopWindow from '@/components/PopWindow.vue';

// 响应式数据
const userList = ref<User[]>([]);
const selectedUser = ref<User | null>(null);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const isDetailModalVisible = ref(false);
const viewMode = ref<'all' | 'pending'>('all');

// 搜索表单
const searchForm = reactive({
    keyword: '',
});

// 详情表单配置
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

// 防抖搜索
let searchTimer: ReturnType<typeof setTimeout>;
const debouncedSearch = (value: string) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        if (value.trim() || !searchForm.keyword) {
            currentPage.value = 1;
            loadUsers();
        }
    }, 500);
};

// 加载用户列表
const loadUsers = async () => {
    loading.value = true;
    try {
        if (viewMode.value === 'pending') {
            // 待审核模式
            const res = await getPendingUsersAPI();
            userList.value = res.data.users || [];
            total.value = userList.value.length;
        } else {
            // 全部用户模式
            const res = await getUserListAPI({
                page: currentPage.value,
                pageSize: pageSize.value,
                keyword: searchForm.keyword.trim() || undefined,
            });
            userList.value = res.data.users || [];
            total.value = res.data.pagination?.total || 0;
        }
    } catch (error) {
        ElMessage.error('获取用户列表失败');
        userList.value = [];
        total.value = 0;
    } finally {
        loading.value = false;
    }
};

/**
 * 审核用户
 * @param user - 待审核用户
 * @param action - 审核操作（approved 或 rejected）
 */
const handleReview = async (user: User, action: 'approved' | 'rejected') => {
    try {
        await reviewUserAPI(user.user_id, { action });
        ElMessage.success(`用户已${action === 'approved' ? '批准' : '拒绝'}`);
        loadUsers();
    } catch (error) {
        ElMessage.error('审核失败');
    }
};

/**
 * 禁用/解禁用户
 * @param user - 待操作用户
 */
const handleToggleDisable = async (user: User) => {
    const disable = !user.is_disabled; // 切换状态
    const actionText = disable ? '禁用' : '解禁';

    try {
        await ElMessageBox.confirm(
            `确定要${actionText}用户【${user.username}】吗？`,
            '操作确认',
            {
                type: 'warning',
            }
        );

        await toggleUserDisableAPI(user.user_id, disable);
        ElMessage.success(`用户账号已成功${actionText}`);
        loadUsers();
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('操作失败');
        }
    }
};

// 打开详情弹窗
const openDetailModal = (user: User) => {
    selectedUser.value = user;
    isDetailModalVisible.value = true;
};

// 关闭弹窗
const closeDetailModal = () => {
    isDetailModalVisible.value = false;
    selectedUser.value = null;
};

// 监听视图模式变化
watch(viewMode, () => {
    currentPage.value = 1;
    searchForm.keyword = '';
    loadUsers();
});

// 监听分页参数（仅在 all 模式有效）
watch([currentPage, pageSize], () => {
    if (viewMode.value === 'all') {
        loadUsers();
    }
});

// 初始化
onMounted(() => {
    loadUsers();
});
</script>

<style scoped>
.user-list {
    padding: 0px 20px;
}

.view-mode-radio {
    margin-bottom: 16px;
}

.pagination {
    margin-top: 20px;
    justify-content: flex-start;
}

.el-table .cell {
    white-space: nowrap;
}
</style>
