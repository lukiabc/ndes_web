<template>
    <div class="article-editor">
        <div class="article-content">
            <div class="header">
                <h1>{{ isEditing ? '编辑文章' : '创建文章' }}</h1>
                <el-button
                    size="small"
                    @click="$router.back()"
                    class="back-button"
                >
                    返回
                </el-button>
            </div>

            <div class="form-container">
                <!-- 表单区域 -->
                <div class="form-section">
                    <div class="form-row">
                        <label class="required">标题：</label>
                        <input
                            v-model="formData.title"
                            placeholder="请输入文章标题"
                            class="form-input"
                            @blur="validateTitle"
                        />
                        <span v-if="errors.title" class="error-msg">{{
                            errors.title
                        }}</span>
                    </div>

                    <div class="form-row">
                        <label class="required">分类：</label>
                        <select
                            v-model="formData.category_id"
                            class="form-select"
                            @change="validateCategory"
                        >
                            <option value="">请选择分类</option>
                            <optgroup
                                v-for="parent in categories"
                                :key="parent.category_id"
                                :label="parent.category_name"
                            >
                                <option
                                    v-for="child in parent.children"
                                    :key="child.category_id"
                                    :value="child.category_id"
                                >
                                    {{ child.category_name }}
                                </option>
                            </optgroup>
                        </select>
                        <span v-if="errors.category" class="error-msg">{{
                            errors.category
                        }}</span>
                    </div>

                    <div class="form-row">
                        <label class="required">来源：</label>
                        <input
                            v-model="formData.source"
                            placeholder="请输入文章来源"
                            class="form-input"
                        />
                    </div>

                    <div class="form-row">
                        <label class="required">编辑者：</label>
                        <input
                            v-model="formData.editor"
                            placeholder="请输入编辑者"
                            class="form-input"
                        />
                    </div>

                    <!-- 富文本编辑器 -->
                    <div class="editor-section">
                        <label class="required">内容：</label>
                        <span v-if="errors.content" class="error-msg">{{
                            errors.content
                        }}</span>
                        <div class="editor-wrapper">
                            <Toolbar
                                class="toolbar"
                                :editor="editorRef"
                                :defaultConfig="toolbarConfig"
                                :mode="mode"
                            />
                            <Editor
                                class="editor"
                                v-model="formData.content"
                                :defaultConfig="editorConfig"
                                :mode="mode"
                                @onCreated="handleCreated"
                            />
                        </div>
                    </div>

                    <!-- 定时发布时间选择 -->
                    <div v-if="showScheduleTime" class="form-row">
                        <label class="required">定时发布时间：</label>
                        <input
                            v-model="formData.scheduled_publish_date"
                            type="datetime-local"
                            class="form-input"
                            :min="minDateTime"
                            @change="validateScheduleTime"
                        />
                        <span v-if="errors.schedule" class="error-msg">{{
                            errors.schedule
                        }}</span>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="action-buttons">
                    <button
                        @click="handleSubmit('draft')"
                        class="btn btn-secondary"
                        :disabled="submitting"
                    >
                        {{
                            submitting && submitType === 'draft'
                                ? '保存中...'
                                : '保存草稿'
                        }}
                    </button>
                    <button
                        @click="handleSubmit('submit')"
                        class="btn btn-primary"
                        :disabled="submitting"
                    >
                        {{
                            submitting && submitType === 'submit'
                                ? '提交中...'
                                : '投稿发布'
                        }}
                    </button>
                    <button
                        @click="toggleSchedule"
                        class="btn btn-schedule"
                        :disabled="submitting"
                    >
                        {{ showScheduleTime ? '取消定时' : '定时发布' }}
                    </button>
                    <button
                        v-if="showScheduleTime"
                        @click="handleSubmit('schedule')"
                        class="btn btn-success"
                        :disabled="submitting"
                    >
                        {{
                            submitting && submitType === 'schedule'
                                ? '提交中...'
                                : '确认定时发布'
                        }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { ElMessage } from 'element-plus';

import {
    getArticleDetailAPI,
    createArticleAPI,
    editArticleAPI,
} from '@/api/article';
import { getCategoryListAPI } from '@/api/category';
import { uploadFileAPI } from '@/api/uploads';
import { useUserStore } from '@/stores/userStore';

const props = defineProps({
    id: { type: String, default: null },
});

const userStore = useUserStore();

const isEditing = computed(() => !!props.id);
const articleId = computed(() => props.id || null);

const ARTICLE_STATUS = {
    DRAFT: '草稿',
    PUBLISHED: '已发布',
    PENDING: '待审',
    REJECTED: '拒绝',
    SCHEDULED: '待发布',
};

// 日期格式化
function toLocalDatetimeString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const i = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d}T${h}:${i}`;
}

// 编辑器实例
const editorRef = shallowRef();
const mode = 'default';

const toolbarConfig = {};
const editorConfig = {
    placeholder: '请输入文章内容...',
    height: 'auto',
    MENU_CONF: {
        uploadImage: {
            customUpload: async (file, insertFn) => {
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const res = await uploadFileAPI(formData);
                    if (res.data.success && res.data.files?.length > 0) {
                        const url = res.data.files[0].url;
                        const alt = res.data.files[0].originalname || '';
                        insertFn(url, alt, url);
                    } else {
                        throw new Error('上传返回数据无效');
                    }
                } catch (err) {
                    console.error('[图片上传失败]', err);
                    showMessage('图片上传失败，请重试', 'error');
                }
            },
        },
        uploadVideo: {
            customUpload: async (file, insertFn) => {
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const res = await uploadFileAPI(formData);
                    if (res.data.success && res.data.files?.length > 0) {
                        const url = res.data.files[0].url;
                        insertFn(url);
                    } else {
                        throw new Error('上传返回数据无效');
                    }
                } catch (err) {
                    console.error('[视频上传失败]', err);
                    showMessage('视频上传失败，请重试', 'error');
                }
            },
        },
    },
};

const formData = reactive({
    title: '',
    category_id: '',
    content: '<p><br></p>',
    source: '',
    editor: '',
    scheduled_publish_date: '',
});

const errors = reactive({
    title: '',
    category: '',
    content: '',
    schedule: '',
});

const categories = ref([]);
const submitting = ref(false);
const submitType = ref('');
const showScheduleTime = ref(false);
const isUnmounted = ref(false);

// 最小可定时间
const minDateTime = computed(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return toLocalDatetimeString(now);
});

// 获取分类列表
const fetchCategories = async () => {
    try {
        const response = await getCategoryListAPI();
        const allCategories = response.data || [];
        const parentCategories = allCategories.filter(
            (cat) => cat.parent_id === null
        );
        const categoryTree = parentCategories.map((parent) => ({
            ...parent,
            children: allCategories.filter(
                (cat) => cat.parent_id === parent.category_id
            ),
        }));
        categories.value = categoryTree.filter(
            (parent) => parent.children.length > 0
        );
    } catch (error) {
        console.error('获取分类失败:', error);
        showMessage('获取分类列表失败，请刷新页面重试', 'error');
    }
};

// 加载文章详情
const fetchArticle = async (id) => {
    try {
        const res = await getArticleDetailAPI(id);
        const data = res.data;

        formData.title = data.title || '';
        formData.category_id = data.category_id?.toString() || '';
        formData.content = data.content || '<p><br></p>';
        formData.source = data.source || '';
        formData.editor = data.editor || '';

        if (data.scheduled_publish_date) {
            showScheduleTime.value = true;
            formData.scheduled_publish_date = toLocalDatetimeString(
                new Date(data.scheduled_publish_date)
            );
        }
    } catch (error) {
        console.error('加载文章失败:', error);
        showMessage('加载文章失败，请检查文章是否存在', 'error');
    }
};

const handleCreated = (editor) => {
    editorRef.value = editor;
};

// 使用 ElMessage 替代自定义消息
const showMessage = (text, type = 'success') => {
    ElMessage({
        message: text,
        type,
        duration: 6000,
        showClose: true,
    });
};

const validateTitle = () => {
    const valid = !!formData.title.trim();
    errors.title = valid ? '' : '标题不能为空';
    return valid;
};

const validateCategory = () => {
    const valid = !!formData.category_id;
    errors.category = valid ? '' : '请选择分类';
    return valid;
};

const validateContent = () => {
    const text = editorRef.value?.getText?.() || '';
    const valid = text.trim().length >= 10;
    errors.content = valid ? '' : '内容不能少于10个字符';
    return valid;
};

const validateScheduleTime = () => {
    if (!showScheduleTime.value) {
        errors.schedule = '';
        return true;
    }
    if (!formData.scheduled_publish_date) {
        errors.schedule = '请选择定时发布时间';
        return false;
    }
    const scheduleTime = new Date(formData.scheduled_publish_date);
    const now = new Date();
    if (scheduleTime <= now) {
        errors.schedule = '定时发布时间必须晚于当前时间';
        return false;
    }
    errors.schedule = '';
    return true;
};

const validateForm = (type) => {
    let isValid = true;

    if (type === 'draft') {
        return validateTitle();
    }

    if (!validateTitle()) isValid = false;
    if (!validateCategory()) isValid = false;
    if (!validateContent()) isValid = false;

    if (type === 'schedule') {
        if (!validateScheduleTime()) isValid = false;
    }

    return isValid;
};

// 切换定时发布
const toggleSchedule = () => {
    showScheduleTime.value = !showScheduleTime.value;
    if (showScheduleTime.value) {
        const defaultTime = new Date();
        defaultTime.setMinutes(defaultTime.getMinutes() + 5);
        formData.scheduled_publish_date = toLocalDatetimeString(defaultTime);
    } else {
        formData.scheduled_publish_date = '';
        errors.schedule = '';
    }
};

// 重置表单
const resetForm = () => {
    if (isUnmounted.value || !editorRef.value) return;

    formData.title = '';
    formData.category_id = '';
    formData.source = '';
    formData.editor = '';
    formData.scheduled_publish_date = '';
    showScheduleTime.value = false;
    errors.title = errors.category = errors.content = errors.schedule = '';

    editorRef.value.setHtml('<p><br></p>');
};

const handleSubmit = async (type) => {
    if (!validateForm(type)) {
        showMessage('请填写完整的表单信息', 'error');
        return;
    }

    submitting.value = true;
    submitType.value = type;

    const actionMap = {
        draft: 'save',
        submit: 'submit',
        schedule: 'schedule',
    };
    const action = actionMap[type];

    try {
        const submitData = {
            title: formData.title.trim(),
            content: formData.content,
            category_id: formData.category_id,
            user_id: userStore.userInfo.result.user_id,
            action,
        };

        if (formData.source) submitData.source = formData.source;
        if (formData.editor) submitData.editor = formData.editor;

        if (type === 'schedule') {
            submitData.scheduled_publish_date = formData.scheduled_publish_date;
        }

        let response;

        if (isEditing.value) {
            response = await editArticleAPI(articleId.value, submitData);
        } else {
            response = await createArticleAPI(submitData, action);
        }

        const { status, message: backendMessage, rejectReason } = response.data;

        let displayMessage = backendMessage;
        let messageType = 'success';

        if (status === ARTICLE_STATUS.REJECTED) {
            displayMessage = `审核未通过：${rejectReason || '原因未知'}`;
            messageType = 'error';
        } else if (status === ARTICLE_STATUS.PENDING) {
            messageType = 'warning';
        }

        showMessage(displayMessage, messageType);

        if (!isEditing.value && type !== 'draft') {
            resetForm();
        }
    } catch (error) {
        console.error('提交失败:', error);
        const errorMsg =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            '提交失败，请重试';
        showMessage(errorMsg, 'error');
    } finally {
        submitting.value = false;
        submitType.value = '';
    }
};

onMounted(async () => {
    document.title = isEditing.value ? '编辑文章' : '创建文章';
    await fetchCategories();
    if (isEditing.value) {
        await fetchArticle(articleId.value);
    }
});

onBeforeUnmount(() => {
    isUnmounted.value = true;
    if (editorRef.value?.destroy) {
        editorRef.value.destroy();
    }
});
</script>

<style lang="scss" scoped>
.article-editor {
    height: calc(100vh - 10px);
    overflow-y: auto;
    padding: 20px;
    box-sizing: border-box;

    h1 {
        font-size: 24px;
        margin-bottom: 20px;
        margin-left: 20px;
        color: #333;
    }
}

.article-content {
    max-width: 1000px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 4px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .back-button {
        margin-right: 25px;
        margin-bottom: 10px;
        border: none;
        border-bottom: 1px solid #a30800;
    }
}

.form-container {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 30px;
}

.form-section {
    margin-bottom: 30px;
}

.form-row {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    position: relative;

    label {
        min-width: 120px;
        font-weight: 500;
        color: #333;

        &.required::before {
            content: '*';
            color: #f56c6c;
            margin-right: 4px;
        }
    }

    .form-input,
    .form-select {
        flex: 1;
        height: 40px;
        padding: 0 15px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        font-size: 14px;
        transition: border-color 0.3s;

        &:focus {
            outline: none;
            border-color: #409eff;
        }

        &:hover {
            border-color: #c0c4cc;
        }
    }

    .form-select {
        cursor: pointer;
    }

    .error-msg {
        position: absolute;
        left: 120px;
        bottom: -20px;
        color: #f56c6c;
        font-size: 12px;
    }
}

.editor-section {
    margin-bottom: 30px;

    > label {
        display: block;
        margin-bottom: 10px;
        font-weight: 500;
        color: #333;

        &.required::before {
            content: '*';
            color: #f56c6c;
            margin-right: 4px;
        }
    }

    .error-msg {
        color: #f56c6c;
        font-size: 12px;
        margin-left: 10px;
    }
}

.editor-wrapper {
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: visible;
    min-height: 500px;

    .toolbar {
        border-bottom: 1px solid #ccc;
    }

    .editor {
        :deep(.w-e-text-container) {
            height: calc(100% - 2px);
            min-height: 500px;
            background-color: #fff;
        }

        :deep(.w-e-text) {
            min-height: 500px;
            height: 100%;
        }
    }
}

.action-buttons {
    display: flex;
    gap: 15px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;

    .btn {
        padding: 10px 24px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        &.btn-primary {
            background: #a30800;
            color: #fff;

            &:hover:not(:disabled) {
                background: #d14c44;
            }
        }

        &.btn-secondary {
            background: #909399;
            color: #fff;

            &:hover:not(:disabled) {
                background: #a6a9ad;
            }
        }

        &.btn-schedule {
            background: #ffb302;
            color: #fff;

            &:hover:not(:disabled) {
                background: #ffca28;
            }
        }

        &.btn-success {
            background: #1dc779;
            color: #fff;

            &:hover:not(:disabled) {
                background: #36d399;
            }
        }
    }
}

optgroup {
    font-weight: bold;
    color: #333;
    background: #f5f7fa;
}

option {
    padding: 8px;
}

@media (max-width: 768px) {
    .form-row {
        flex-direction: column;
        align-items: flex-start;

        label {
            margin-bottom: 8px;
        }

        .form-input,
        .form-select {
            width: 100%;
        }

        .error-msg {
            left: 0;
        }
    }

    .action-buttons {
        flex-direction: column;

        .btn {
            width: 100%;
        }
    }
}
</style>
