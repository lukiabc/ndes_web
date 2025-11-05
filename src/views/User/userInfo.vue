<template>
    <div style="display: flex; flex-direction: column">
        <div>
            <el-header style="background-color: #a30800">
                <div
                    style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        height: 100%;
                    "
                >
                    <span style="margin-left: 5px; color: aliceblue"
                        >个人中心</span
                    >
                    <el-link @click="goBack" style="color: aliceblue"
                        >返回</el-link
                    >
                </div>
            </el-header>
        </div>
        <div class="box1">
            <el-card class="personal-info-card">
                <div class="info">个人资料</div>
                <div class="box2">
                    <img
                        v-if="userInfo.avatar_url"
                        :src="userInfo.avatar_url"
                        class="avatar"
                    />
                    <img v-else :src="defaultAvatarUrl" class="avatar" />
                    <!-- </el-upload> -->
                </div>
                <div style="margin-top: 50px">
                    <el-card
                        class="profile-details-card"
                        style="margin-top: 20px"
                    >
                        <span class="edit-button" @click="openEditModal"
                            >编辑</span
                        >
                        <div class="profile-info">
                            <h4 style="margin-right: 85%">基本信息</h4>
                            <div>
                                <div class="profile-item">
                                    账号 : {{ userInfo.user_id }}
                                </div>
                                <div class="profile-item">
                                    用户名 : {{ userInfo.username }}
                                </div>
                                <div class="profile-item">
                                    角色:
                                    {{
                                        parseInt(userInfo.role_id) === 1
                                            ? '管理员'
                                            : parseInt(userInfo.role_id) === 2
                                            ? '编辑'
                                            : '未知角色'
                                    }}
                                </div>
                                <div class="profile-item">
                                    邮箱 : {{ userInfo.email }}
                                </div>
                            </div>
                        </div>
                    </el-card>
                </div>
            </el-card>
        </div>
        <!-- 弹框组件 -->

        <PopWindow
            :isOpen="isEditModalOpen"
            title="编辑个人信息"
            bgColor="white"
            width="400px"
            height="600px"
            :showFooter="false"
            @close="closeEditModal"
        >
            <FormModule
                :formList="editFormList"
                :editItem="editUserInfo"
                mode="edit"
                @submitData="handleFormSubmit"
                @cancel="cancelFrom"
            />
        </PopWindow>
    </div>
</template>

<script lang="ts" setup>
import { editUserInfoAPI } from '@/api/user';
import FormModule from '@/components/FromModule.vue';
import PopWindow from '@/components/PopWindow.vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const userInfo: any = ref('');
userInfo.value = userStore.userInfo.result;
const defaultAvatarUrl = 'http://localhost:3000/uploads/gs1761126308494.jpg';

// 控制弹框显示
const isEditModalOpen = ref(false);

const editFormList = ref([
    {
        name: 'avatar_url',
        label: '头像',
        type: 'file',
        accept: 'image/*',
    },
    {
        name: 'username',
        label: '用户名',
        type: 'text',
        required: true,
    },
    {
        name: 'email',
        label: '邮箱',
        type: 'text',
        required: true,
    },
]);

// 用于编辑的用户信息
const editUserInfo = computed(() => ({
    avatar_url: userInfo.value.avatar_url,
    username: userInfo.value.username,
    email: userInfo.value.email,
}));

// 处理表单提交
const handleFormSubmit = async (formData: any) => {
    try {
        const response = await editUserInfoAPI(
            userInfo.value.user_id,
            formData
        );

        if (response.data && response.data.message) {
            alert(response.data.message);

            const updatedUser = response.data.data;
            userInfo.value.username = updatedUser.username;
            userInfo.value.email = updatedUser.email;
            userInfo.value.avatar_url = updatedUser.avatar_url;
            userInfo.value.updated_at = updatedUser.updated_at;

            closeEditModal();
        } else {
            alert('更新失败，请重试');
        }
    } catch (error) {
        console.error('更新用户信息失败：', error);
        alert('更新失败，请重试');
    }
};

const cancelFrom = () => {
    closeEditModal();
};

const openEditModal = () => {
    isEditModalOpen.value = true;
    console.log(isEditModalOpen.value);
};

const closeEditModal = () => {
    isEditModalOpen.value = false;
};

const goBack = function () {
    router.go(-1); // 返回上一页
};
</script>

<style lang="scss" scoped>
.box1 {
    padding: 50px;
    width: 50%;
    height: 650px;
    position: absolute;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    border-radius: 20px;
    background-color: hsla(0, 0%, 100%, 0.9);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 10px rgba(0, 0, 0, 0.14);
}

.personal-info-card {
    height: 100%;
    width: 100%;
    overflow: auto;
    text-align: center;
}

.info {
    border-bottom: 1px solid rgba(43, 42, 51, 0.5);
    width: 95%;
    height: 50px;
    line-height: 50px;
    font-size: 15px;
    margin: 0 auto;
    color: rgba(43, 42, 51, 0.7);
    font-weight: 600;
}

.box2 {
    width: 130px;
    height: 130px;
    margin: 20px auto;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.22), 0 0 10px rgba(0, 0, 0, 0.04);
    display: flex;
    justify-content: center;
    align-items: center;
}

.avatar-uploader .avatar {
    width: 130px;
    height: 130px;
    margin: 10px auto;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.22), 0 0 10px rgba(0, 0, 0, 0.04);
}

.avatar {
    border: 1px dashed var(--el-border-color);
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.avatar-uploader .el-upload:hover {
    border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
}

.profile-details-card {
    margin-top: 20px;
    width: 100%;
}

.profile-info h4 {
    margin-bottom: 20px;
}

.profile-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    margin-left: 25px;
}
.profile-item:nth-last-child(1) {
    margin-bottom: 10px;
}
.profile-item strong {
    min-width: 70px;
    font-weight: bold;
    color: #333;
}

.profile-item span {
    margin-left: 10px;
    color: #666;
}

.edit-button {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-right: 10px;
    cursor: pointer;
    color: #999;
    font-size: 14px;
}
</style>
