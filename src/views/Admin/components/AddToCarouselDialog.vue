<!-- 添加到轮播图弹窗 -->
<template>
    <el-dialog
        v-model="visible"
        title="添加到轮播图"
        width="500px"
        @close="resetForm"
    >
        <!--@submit.prevent 阻止默认提交行为-->
        <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="100px"
            @submit.prevent
        >
            <!-- 封面上传 -->
            <el-form-item label="轮播封面" prop="cover_image">
                <div class="upload-container">
                    <img
                        v-if="form.cover_image"
                        :src="form.cover_image"
                        class="preview-img"
                    />
                    <el-button
                        type="primary"
                        size="small"
                        @click="triggerUpload"
                        :loading="uploading"
                    >
                        {{ form.cover_image ? '重新上传' : '点击上传' }}
                    </el-button>
                    <input
                        ref="fileInput"
                        type="file"
                        accept="image/*"
                        style="display: none"
                        @change="handleFileChange"
                    />
                </div>
            </el-form-item>

            <!-- 标题 -->
            <el-form-item label="标题" prop="title">
                <el-input v-model="form.title" placeholder="请输入轮播图标题" />
            </el-form-item>

            <!-- 开始日期 -->
            <el-form-item label="开始日期">
                <el-date-picker
                    v-model="form.start_play_date"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="选择日期"
                    clearable
                    style="width: 100%"
                />
            </el-form-item>

            <!-- 结束日期 -->
            <el-form-item label="结束日期">
                <el-date-picker
                    v-model="form.end_play_date"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="选择日期"
                    clearable
                    style="width: 100%"
                />
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="visible = false">取消</el-button>
            <el-button type="primary" @click="submit" :loading="submitting">
                确定
            </el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { uploadFileAPI } from '@/api/uploads';
import { createCarouselsAPI, type Carousel } from '@/api/carousels';

const props = defineProps<{
    articleId: number;
    articleTitle: string;
}>();

// 成功添加后通知父组件
const emit = defineEmits<{
    (e: 'success'): void;
}>();

// 控制弹窗显示状态
const visible = defineModel<boolean>('visible', { required: true });

const formRef = ref<FormInstance>(); // 表单实例引用
const fileInput = ref<HTMLInputElement | null>(null); // 文件输入引用
const uploading = ref(false); // 上传状态
const submitting = ref(false); // 提交状态

// 表单数据对象
const form = reactive({
    cover_image: '',
    title: props.articleTitle, // 默认使用文章标题
    start_play_date: '',
    end_play_date: '',
});

// 表单校验规则
const rules = {
    cover_image: [
        { required: true, message: '请上传轮播图封面', trigger: 'submit' },
    ],
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
};

// 触发文件选择
const triggerUpload = () => {
    fileInput.value?.click();
};

// 处理文件选择
const handleFileChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    // 简单校验
    if (!file.type.startsWith('image/')) {
        ElMessage.warning('请选择图片文件');
        return;
    }

    uploading.value = true;
    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await uploadFileAPI(formData);
        if (res.data.success && res.data.files?.[0]?.url) {
            form.cover_image = res.data.files[0].url;
        } else {
            ElMessage.error('上传失败，请重试');
        }
    } catch (error: any) {
        console.error('上传错误:', error);
        ElMessage.error(error?.response?.data?.message || '上传失败');
    } finally {
        uploading.value = false;
        // 重置 input 确保下次能触发 change
        if (target) target.value = '';
    }
};

// 提交表单
const submit = async () => {
    // 手动触发表单校验
    await formRef.value?.validate((valid) => {
        if (!valid) return;
    });

    submitting.value = true;
    try {
        const payload: Carousel = {
            article_id: props.articleId,
            cover_image: form.cover_image,
            title: form.title.trim(),
            sort_order: 0,
            is_active: true,
            start_play_date: form.start_play_date || null,
            end_play_date: form.end_play_date || null,
        };

        await createCarouselsAPI(payload);
        ElMessage.success('轮播图添加成功');
        emit('success'); // 通知父组件刷新列表
        visible.value = false;
    } catch (error: any) {
        const msg = error?.response?.data?.error || '操作失败';
        ElMessage.error(msg);
    } finally {
        submitting.value = false;
    }
};

// 重置表单
const resetForm = () => {
    form.cover_image = '';
    form.title = props.articleTitle;
    form.start_play_date = '';
    form.end_play_date = '';
    if (formRef.value) formRef.value.clearValidate();
};
</script>

<style scoped>
.upload-container {
    display: flex;
    align-items: center;
    gap: 12px;
}
.preview-img {
    width: 120px;
    height: 60px;
    object-fit: cover;
    border: 1px solid #ddd;
    border-radius: 4px;
}
.tip {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
}
</style>
