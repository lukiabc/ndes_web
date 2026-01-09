<template>
    <div class="article-editor">
        <div class="header">
            <div class="header-left">
                <div class="main-title">国防教育网站管理</div>
                <el-icon class="icon-right"><ArrowRight /></el-icon>
                <div class="title">
                    {{ isEditing ? '编辑文章' : '创建文章' }}
                </div>
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
                            <!-- <el-dropdown-item
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
                            </el-dropdown-item> -->
                            <el-dropdown-item
                                command="ArticleVersionHistory"
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
            </div>
        </div>

        <!-- 成功发布页 -->
        <div v-if="showSuccessPage" class="success-page">
            <div class="success-icon" :class="successIconType">
                <el-icon v-if="successIconType === 'success'"
                    ><SuccessFilled
                /></el-icon>
                <el-icon v-else-if="successIconType === 'info'"
                    ><InfoFilled
                /></el-icon>
                <el-icon v-else-if="successIconType === 'warning'"
                    ><WarningFilled
                /></el-icon>
                <el-icon v-else><CircleCloseFilled /></el-icon>
            </div>
            <div class="success-title">{{ successTitle }}</div>
            <div class="success-buttons">
                <button class="btn btn-outline" @click="viewArticle">
                    查看文章
                </button>
                <button class="btn btn-outline" @click="manageArticles">
                    管理博文
                </button>
                <button class="btn btn-outline" @click="startNewArticle">
                    再写一篇
                </button>
            </div>
        </div>

        <!-- 编辑表单（仅在未成功提交时显示） -->
        <div v-else class="scrollable-content">
            <div class="form-container">
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
            </div>
        </div>

        <!-- 底部操作按钮（仅在编辑状态显示） -->
        <div v-if="!showSuccessPage" class="action-buttons">
            <button
                @click="handleSubmit('save')"
                class="btn btn-secondary"
                :disabled="submitting"
            >
                {{
                    submitting && submitType === 'save'
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
</template>

<script lang="ts" setup>
import {
    createArticleAPI,
    editArticleAPI,
    getArticleDetailAPI,
} from '@/api/article';
import { getCategoryListAPI } from '@/api/category';
import { uploadFileAPI } from '@/api/uploads';
import { useUserStore } from '@/stores/userStore';
import {
    ArrowRight,
    CircleCloseFilled,
    Clock,
    Document,
    Edit,
    InfoFilled,
    Refresh,
    Star,
    SuccessFilled,
    SwitchButton,
    User,
    WarningFilled,
} from '@element-plus/icons-vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const props = defineProps({
    id: { type: String, default: null },
});

const userStore = useUserStore();
const router = useRouter();

const handleCommand = (command: string) => {
    switch (command) {
        case 'userInfo':
            router.push('/userInfo');
            break;
        case 'content':
            router.push('/user/content');
            break;
        case 'draft':
            router.push('/user/draft');
            break;
        case 'favorites':
            router.push('/user/favorites');
            break;
        case 'history':
            router.push('/user/history');
            break;
        case 'ArticleVersionHistory':
            router.push('/user/ArticleVersionHistory');
            break;
        case 'logout':
            userStore.clearUserInfo();
            router.push('/login');
            break;
        default:
            console.warn('未知的下拉菜单命令:', command);
    }
};

const isEditing = computed(() => !!props.id);
const editingId = props.id; // 原始编辑 ID（只读）
const currentArticleId = ref<string | null>(props.id || null); // 可变，用于新建后赋值

const ARTICLE_STATUS = {
    save: '草稿',
    PUBLISHED: '已发布',
    PENDING: '待审',
    REJECTED: '拒绝',
    SCHEDULED: '待发布',
};

function toLocalDatetimeString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const i = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d}T${h}:${i}`;
}

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
                    // 👇 按 wangEditor v5 标准解析
                    if (
                        res.data.errno === 0 &&
                        Array.isArray(res.data.data) &&
                        res.data.data.length > 0
                    ) {
                        const { url } = res.data.data[0];
                        const alt = file.name || '';
                        insertFn(url, alt, url); // (url, alt, href)
                    } else {
                        throw new Error(res.data.message || '上传返回数据无效');
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
                    if (
                        res.data.errno === 0 &&
                        Array.isArray(res.data.data) &&
                        res.data.data.length > 0
                    ) {
                        const { url } = res.data.data[0];
                        insertFn(url); // 视频只需传 url
                    } else {
                        throw new Error(res.data.message || '上传返回数据无效');
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
const showSuccessPage = ref(false); // 新增：控制成功页显示
const successTitle = ref('');
const successIconType = ref('success');

const SUCCESS_CONFIG = {
    save: {
        title: '文章已保存为草稿',
        iconType: 'success', // 用于匹配图标
    },
    submit: {
        title: '文章已投稿，等待审核',
        iconType: 'success',
    },
    schedule: {
        title: '文章已设置为定时发布',
        iconType: 'success',
    },
    error: {
        title: '操作失败，请重试',
        iconType: 'error',
    },
    info: {
        title: '操作已完成',
        iconType: 'info',
    },
};

const minDateTime = computed(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return toLocalDatetimeString(now);
});

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

const showMessage = (
    text: string,
    type: 'success' | 'warning' | 'info' | 'error' = 'success'
) => {
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

    if (type === 'save') {
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

const resetForm = () => {
    if (isUnmounted.value || !editorRef.value) return;

    formData.title = '';
    formData.category_id = '';
    formData.content = '<p><br></p>';
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
        save: 'save',
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
        } as any;

        if (formData.source) submitData.source = formData.source;
        if (formData.editor) submitData.editor = formData.editor;

        if (type === 'schedule') {
            submitData.scheduled_publish_date = formData.scheduled_publish_date;
        }

        let response;
        let newArticleId = null;

        if (isEditing.value) {
            response = await editArticleAPI(editingId, submitData);
            newArticleId = editingId;
        } else {
            response = await createArticleAPI(submitData, action);
            // 假设后端返回 article_id 或 id 字段
            newArticleId = response.data.article.article_id;

            if (newArticleId) {
                currentArticleId.value = String(newArticleId);
            }
        }

        const { status, message: backendMessage, rejectReason } = response.data;

        let displayMessage = backendMessage;
        let messageType = 'success';

        // 处理审核状态
        if (status === ARTICLE_STATUS.REJECTED) {
            displayMessage = `审核未通过：${rejectReason || '原因未知'}`;
            messageType = 'error';
        } else if (
            status === ARTICLE_STATUS.PENDING ||
            status === ARTICLE_STATUS.SCHEDULED
        ) {
            messageType = 'success';
        }

        // 设置成功页内容
        if (messageType === 'error') {
            // 错误时仍可选择进结果页
            successTitle.value = displayMessage;
            successIconType.value = 'error';
            showSuccessPage.value = true;
        } else {
            // 成功类操作
            successTitle.value = SUCCESS_CONFIG[type]?.title || '操作成功';
            successIconType.value = SUCCESS_CONFIG[type]?.iconType || 'success';
            showSuccessPage.value = true;
        }

        showSuccessPage.value = true;
    } catch (error) {
        const errorMsg =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            '提交失败，请重试';

        successTitle.value = errorMsg;
        successIconType.value = 'error';
        showSuccessPage.value = true;
    } finally {
        submitting.value = false;
        submitType.value = '';
    }
};

// 按钮方法
const viewArticle = () => {
    console.log(currentArticleId.value, 'viewArticle');
    if (!currentArticleId.value) {
        showMessage('无法查看文章：ID 不存在', 'error');
        return;
    }
    router.push(`/articleDetail/${currentArticleId.value}`);
};

const manageArticles = () => {
    router.push('/user/content');
};

const startNewArticle = () => {
    resetForm();
    showSuccessPage.value = false;
    currentArticleId.value = null;
};

onMounted(async () => {
    document.title = isEditing.value ? '编辑文章' : '创建文章';
    await fetchCategories();
    if (isEditing.value) {
        await fetchArticle(editingId);
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
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background-color: #f5f7fa;
    padding: 0;
}

.header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    color: #333;
    align-items: center;
    gap: 8px;

    .main-title {
        font-size: 18px;
        font-weight: 500;
    }

    .title {
        font-size: 16px;
        font-weight: 500;
    }

    .icon-right {
        font-size: 16px;
    }
}

.header-right {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-right: 40px;
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

.scrollable-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 20px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    height: calc(100vh - 160px);
}

.form-container {
    max-width: 1000px;
    margin: 0 auto;
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
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    padding: 15px 250px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
    display: flex;
    gap: 15px;
    justify-content: flex-end;

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

.success-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 160px);
    padding: 40px;
    text-align: center;
    background: white;

    .success-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 32px;
        margin-bottom: 24px;

        &.success {
            background-color: #67c23a; // 成功绿色
        }
        &.info {
            background-color: #909399; // 信息灰色
        }
        &.warning {
            background-color: #e6a23c; // 警告黄色
        }
        &.error {
            background-color: #f56c6c; // 错误红色
        }
    }

    .success-title {
        font-size: 18px;
        font-weight: 500;
        color: #333;
        margin-bottom: 32px;
    }

    .success-buttons {
        display: flex;
        gap: 16px;
    }

    .btn {
        padding: 10px 24px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover:not(:disabled) {
            transform: translateY(-2px);
        }

        &.btn-outline {
            border: 1px solid #dcdfe6;
            background: white;
            color: #333;
            &:hover {
                border-color: #a0aec0;
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

    .success-buttons {
        flex-direction: column;
        .btn {
            width: 100%;
            margin-bottom: 10px;
        }
    }
}
</style>
