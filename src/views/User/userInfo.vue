<template>
    <div style="display: flex; flex-direction: column">
        <el-header style="background-color: #a30800">
            <div
                style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    height: 100%;
                "
            >
                <span style="margin-left: 5px; color: aliceblue">个人中心</span>
                <el-link @click="goBack" style="color: aliceblue">返回</el-link>
            </div>
        </el-header>

        <div class="box1">
            <el-card class="personal-info-card">
                <div class="info">个人资料</div>
                <div class="box2" @click="openAvatarPreview">
                    <img
                        v-if="userInfo.avatar_url"
                        :src="userInfo.avatar_url"
                        class="avatar"
                    />
                    <img v-else :src="defaultAvatarUrl" class="avatar" />
                </div>
                <div style="margin-top: 50px">
                    <el-card class="profile-details-card">
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
                                        userInfo.role_id === 1
                                            ? '管理员'
                                            : userInfo.role_id === 2
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

        <!-- 编辑个人信息弹窗 -->
        <PopWindow
            :isOpen="isEditModalOpen"
            title="编辑个人信息"
            bgColor="white"
            width="400px"
            height="300px"
            :showFooter="false"
            @close="closeEditModal"
        >
            <div style="padding: 20px">
                <el-form-item label="用户名">
                    <el-input v-model="form.username" />
                </el-form-item>

                <el-form-item label="邮箱">
                    <el-input v-model="form.email" />
                </el-form-item>

                <div style="text-align: right; margin-top: 20px">
                    <el-button @click="closeEditModal">取消</el-button>
                    <el-button type="primary" @click="handleSubmit"
                        >保存</el-button
                    >
                </div>
            </div>
        </PopWindow>

        <!-- 头像大图预览 -->
        <el-dialog
            v-model="isAvatarPreviewOpen"
            width="500px"
            :show-close="true"
            :close-on-click-modal="true"
            @close="closeAvatarPreview"
        >
            <div style="text-align: center">
                <img
                    :src="userInfo.avatar_url || defaultAvatarUrl"
                    style="
                        max-width: 100%;
                        max-height: 400px;
                        border-radius: 8px;
                        object-fit: contain;
                    "
                />
                <div style="margin-top: 20px">
                    <el-button type="primary" @click="triggerFileSelect">
                        修改头像
                    </el-button>
                </div>
            </div>
            <!-- 隐藏的文件输入 -->
            <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleAvatarUpload"
            />
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ElMessage, ElLoading } from 'element-plus';
import { editUserInfoAPI } from '@/api/user';
import { uploadFileAPI } from '@/api/uploads';
import PopWindow from '@/components/PopWindow.vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

// 当前用户信息
const userInfo = computed(() => userStore.userInfo.result);
const defaultAvatarUrl = 'http://localhost:3000/uploads/gs1761126308494.jpg';

// 编辑弹窗控制
const isEditModalOpen = ref(false);
const form = ref({
    username: '',
    email: '',
});

// 头像预览 Modal 控制
const isAvatarPreviewOpen = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// 打开编辑弹窗
const openEditModal = () => {
    isEditModalOpen.value = true;
    form.value.username = userInfo.value.username;
    form.value.email = userInfo.value.email;
};

// 提交编辑表单
const handleSubmit = async () => {
    const updateData = {
        username: form.value.username.trim(),
        email: form.value.email.trim(),
        avatar_url: userInfo.value.avatar_url,
    };

    try {
        const res = await editUserInfoAPI(userInfo.value.user_id, updateData);

        if (res.data?.message) {
            ElMessage.success(res.data.message);

            userStore.userInfo.result = {
                ...userStore.userInfo.result,
                username: res.data.data.username,
                email: res.data.data.email,
                updated_at: res.data.data.updated_at,
            };

            closeEditModal();
        } else {
            ElMessage.error('更新失败，请重试');
        }
    } catch (error) {
        console.error('更新用户信息失败:', error);
        ElMessage.error('请求失败，请稍后重试');
    }
};

const closeEditModal = () => {
    isEditModalOpen.value = false;
};

// 头像预览相关
const openAvatarPreview = () => {
    isAvatarPreviewOpen.value = true;
};

const closeAvatarPreview = () => {
    isAvatarPreviewOpen.value = false;
};

// 触发文件选择
const triggerFileSelect = () => {
    if (fileInputRef.value) {
        fileInputRef.value.click();
    }
};

// 头像上传处理
const handleAvatarUpload = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // 显示 loading 遮罩
    const loadingInstance = ElLoading.service({
        text: '正在上传头像...',
        background: 'rgba(0, 0, 0, 0.5)',
        lock: true,
    });

    try {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await uploadFileAPI(formData);
        if (uploadRes.data?.success && uploadRes.data.files?.[0]?.url) {
            const newAvatarUrl = uploadRes.data.files[0].url;

            const updateRes = await editUserInfoAPI(userInfo.value.user_id, {
                username: userInfo.value.username,
                email: userInfo.value.email,
                avatar_url: newAvatarUrl,
            });

            if (updateRes.data?.message) {
                ElMessage.success('头像更新成功！');

                userStore.userInfo.result = {
                    ...userStore.userInfo.result,
                    avatar_url: newAvatarUrl,
                    updated_at:
                        updateRes.data.data?.updated_at ||
                        new Date().toISOString(),
                };

                closeAvatarPreview();
            } else {
                ElMessage.error('头像更新失败');
            }
        } else {
            ElMessage.error('上传失败，请重试');
        }
    } catch (err) {
        console.error('头像上传或更新失败:', err);
        ElMessage.error('操作失败，请检查网络或文件格式');
    } finally {
        loadingInstance.close(); // 关闭 loading
        if (input) input.value = ''; // 重置 input
    }
};

// 返回上一页
const goBack = () => {
    router.go(-1);
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
    cursor: zoom-in;
}

.avatar {
    border: 1px dashed var(--el-border-color);
    border-radius: 50%;
    width: 100%;
    height: 100%;
    object-fit: cover;
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
