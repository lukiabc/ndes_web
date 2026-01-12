<!-- 轮播图管理弹窗组件 -->
<template>
    <el-dialog
        v-model="visible"
        :title="isEdit ? '编辑轮播图' : '添加到轮播图'"
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
                    <!-- 封面图片预览 -->
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

            <!-- 状态开关 -->
            <el-form-item label="状态">
                <el-switch
                    v-model="form.is_active"
                    active-text="启用"
                    inactive-text="停用"
                    :active-value="true"
                    :inactive-value="false"
                />
            </el-form-item>

            <!-- 排序权重 -->
            <el-form-item label="排序权重">
                <el-input-number
                    v-model="form.sort_order"
                    :min="0"
                    :max="9999"
                    controls-position="right"
                    style="width: 100%"
                />
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
import {
    createCarouselsAPI,
    updateCarouselsAPI,
    type Carousel,
} from '@/api/carousels';

const props = defineProps<{
    articleId?: number; // 新增时需要关联的文章 ID
    articleTitle?: string; // 新增时默认标题
    isEdit?: boolean;
    carouselId?: number; // 编辑时必需轮播图 ID
    initialData?: Carousel; // 初始数据（用于编辑）
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
    cover_image: props.initialData?.cover_image || '',
    title: props.initialData?.title || props.articleTitle || '',
    start_play_date: props.initialData?.start_play_date || '',
    end_play_date: props.initialData?.end_play_date || '',
    is_active: props.initialData?.is_active ?? true,
    sort_order: props.initialData?.sort_order ?? 0,
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
    await formRef.value?.validate((valid) => {
        if (!valid) return;
    });

    submitting.value = true;
    try {
        const payload: Partial<Carousel> = {
            cover_image: form.cover_image,
            title: form.title.trim(),
            start_play_date: form.start_play_date || null,
            end_play_date: form.end_play_date || null,
            is_active: form.is_active,
            sort_order: form.sort_order,
        };

        if (props.isEdit && props.carouselId) {
            // 编辑模式
            await updateCarouselsAPI(props.carouselId, payload);
            ElMessage.success('轮播图更新成功');
        } else {
            // 新增模式
            if (!props.articleId) {
                ElMessage.error('缺少关联文章ID');
                return;
            }
            await createCarouselsAPI({
                ...payload,
                article_id: props.articleId,
                sort_order: 0,
                is_active: true,
            } as Carousel);
            ElMessage.success('轮播图添加成功');
        }

        emit('success');
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
    // 重置为初始状态
    form.cover_image = props.initialData?.cover_image || '';
    form.title = props.initialData?.title || props.articleTitle || '';
    form.start_play_date = props.initialData?.start_play_date || '';
    form.end_play_date = props.initialData?.end_play_date || '';
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
