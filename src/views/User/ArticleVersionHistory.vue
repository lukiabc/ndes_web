<template>
    <div class="user-version-history">
        <!-- 状态提示 -->
        <el-alert
            v-if="!isLogin"
            title="请先登录"
            type="warning"
            description="登录后才能查看您的编辑历史。"
            show-icon
            style="margin-bottom: 20px"
        />
        <el-skeleton v-else-if="loading" :rows="6" animated />
        <el-alert v-else-if="error" :title="error" type="error" show-icon />

        <!-- 版本列表 -->
        <el-table v-else :data="versionList" style="width: 100%">
            <el-table-column
                label="序号"
                type="index"
                prop="index"
                width="80"
            />
            <el-table-column
                label="文章ID"
                prop="article_id"
                width="100"
                sortable
            />
            <el-table-column label="版本号" width="100">
                <template #default="{ row }">
                    v{{ row.version_number }}
                </template>
            </el-table-column>
            <el-table-column label="文章标题" min-width="100">
                <template #default="{ row }">
                    <el-link
                        type="primary"
                        @click="goToArticle(row.article_id)"
                    >
                        {{ row.title }}
                    </el-link>
                </template>
            </el-table-column>
            <el-table-column label="内容摘要" min-width="200" sortable>
                <template #default="scope">
                    <span v-html="getExcerpt(scope.row.content)" />
                </template>
            </el-table-column>
            <el-table-column label="编辑人" width="180">
                <template #default="{ row }">
                    <div>{{ row.editor || '系统' }}</div>
                    <div style="color: #999; font-size: 12px">
                        {{ formatDate(row.created_at) }}
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                    <el-button
                        size="small"
                        type="primary"
                        plain
                        @click="showDiff(row)"
                    >
                        查看差异
                    </el-button>

                    <el-button
                        size="small"
                        type="warning"
                        @click="handleRevert(row)"
                    >
                        回溯
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination
            v-if="isLogin && !loading && versionList.length > 0"
            background
            layout="total, prev, pager, next, jumper"
            :current-page="page"
            :page-size="limit"
            :total="totalItems"
            @current-change="handlePageChange"
            style="margin-top: 20px; justify-content: center; display: flex"
        />

        <!-- 差异对比弹窗 -->
        <el-dialog
            v-model="diffDialogVisible"
            title="版本差异对比"
            width="90%"
            destroy-on-close
            class="diff-dialog"
            :draggable="true"
            :center="true"
        >
            <div v-if="baseVersion && targetVersion" class="diff-container">
                <div class="diff-content">
                    <div class="diff-column">
                        <div class="diff-column-header">
                            <el-tag type="danger" size="large">
                                当前最新版本 (v{{ baseVersion.version_number }})
                            </el-tag>
                        </div>
                        <div class="diff-column-content">
                            <h4 style="text-align: center">
                                {{ baseVersion.title }}
                            </h4>
                            <div v-html="baseVersion.content" />
                        </div>
                    </div>

                    <div class="diff-column">
                        <div class="diff-column-header">
                            <el-tag type="success" size="large">
                                选中历史版本 (v{{
                                    targetVersion.version_number
                                }})
                            </el-tag>
                        </div>
                        <div class="diff-column-content">
                            <h4 style="text-align: center">
                                {{ targetVersion.title }}
                            </h4>
                            <div v-html="targetVersion.content" />
                        </div>
                    </div>
                </div>
                <el-alert
                    title="说明"
                    type="info"
                    description="左右两侧分别显示当前最新版本和历史版本的完整内容，方便您直接对比。"
                    show-icon
                    :closable="false"
                />
            </div>
            <template #footer>
                <div
                    style="
                        display: flex;
                        justify-content: flex-end;
                        width: 100%;
                    "
                >
                    <el-button @click="diffDialogVisible = false"
                        >关闭</el-button
                    >
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import {
    getLatestVersionAPI,
    getVersionDetailAPI,
    getVersionsByUserAPI,
    revertToVersionAPI,
    type ArticleVersionItem,
} from '@/api/articleVersion';
import { useUserStore } from '@/stores/userStore';
import dayjs from 'dayjs';
import DOMPurify from 'dompurify';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, ref } from 'vue';

const userStore = useUserStore();

// --- 状态管理 ---
const loading = ref(false);
const error = ref<string | null>(null);
const diffDialogVisible = ref(false);
const diffHtml = ref('');

// 差异计算用的临时变量
const baseVersion = ref<ArticleVersionItem | null>(null); // 最新版
const targetVersion = ref<ArticleVersionItem | null>(null); // 选中的旧版本

// --- 列表与分页 ---
const page = ref(1);
const limit = ref(10);
const totalItems = ref(0);
const versionList = ref<ArticleVersionItem[]>([]);

// --- 格式化函数 ---
const formatDate = (dateStr: string) =>
    dayjs(dateStr).format('YYYY-MM-DD HH:mm');

const getExcerpt = (content: string) => {
    const clean = content.replace(/<[^>]+>/g, '');
    return clean.length > 80 ? clean.slice(0, 80) + '...' : clean;
};

const sanitizeHTML = (html: string) => DOMPurify.sanitize(html);

const goToArticle = (articleId: number) => {
    window.open(`/articleDetail/${articleId}`, '_blank');
};

// 获取用户的版本列表
const fetchVersions = async () => {
    if (!isLogin.value || !currentUserId.value) return;
    loading.value = true;
    error.value = null;
    try {
        const res = await getVersionsByUserAPI(
            currentUserId.value,
            page.value,
            limit.value
        );
        versionList.value = res.data.versions;
        totalItems.value = res.data.pagination.total_items;
    } catch (err: any) {
        error.value =
            err?.response?.data?.message || err?.message || '加载版本记录失败';
        ElMessage.error(error.value);
    } finally {
        loading.value = false;
    }
};

// 查看版本差异
const showDiff = async (targetRow: ArticleVersionItem) => {
    try {
        // 获取文章的最新版本信息
        const latestVersionRes: any = await getLatestVersionAPI(
            targetRow.article_id
        );

        // 获取最新版本的详细信息
        const latestVersionDetailRes = await getVersionDetailAPI(
            latestVersionRes.data.version_id
        );
        const latest = latestVersionDetailRes.data;

        baseVersion.value = latest;
        targetVersion.value = targetRow;

        diffDialogVisible.value = true;
    } catch (err) {
        ElMessage.error('加载差异失败');
    }
};

// 回溯到指定版本
const handleRevert = async (targetRow: ArticleVersionItem) => {
    try {
        await ElMessageBox.confirm(
            `确定要将文章回溯到版本 v${targetRow.version_number} 吗？此操作不可撤销。`,
            '警告',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );

        // 执行回溯 API
        await revertToVersionAPI(targetRow.article_id, {
            version_number: targetRow.version_number,
            user_id: currentUserId.value,
            editor: userStore.userInfo.result.username,
        });

        ElMessage.success('回溯成功！');
        fetchVersions(); // 刷新列表
    } catch (err) {
        // 如果是用户取消，不提示错误
        if (err !== 'cancel') {
            ElMessage.error('回溯失败');
        }
    }
};

// 分页与生命周期处理
const handlePageChange = (newPage: number) => {
    page.value = newPage;
    fetchVersions();
};

const isLogin = computed(() => userStore.isLogin);
const currentUserId = computed(() => Number(userStore.userInfo.result.user_id));

onMounted(() => {
    if (isLogin.value) {
        fetchVersions();
    }
});
</script>

<style lang="scss" scoped>
.user-version-history {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    min-height: 700px;
}
:deep(.diff-dialog) {
    .el-dialog__body {
        padding: 10px 20px;
        max-height: 80vh;
        background: #f5f5f5;
    }
}

.diff-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.diff-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    padding: 10px;
    background: #f0f0f0;
    border-radius: 4px;
}

.diff-content {
    display: flex;
    gap: 20px;
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    border: 1px solid #ddd;
    min-height: 500px;
    max-height: 60vh;
    overflow: auto;
}

.diff-column {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.diff-column-header {
    text-align: center;
    margin-bottom: 15px;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 4px;
}

.diff-column-content {
    flex: 1;
    padding: 15px;
    background: #fafafa;
    border: 1px solid #eee;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-all;
    overflow-y: auto;
    max-height: 50vh;
}

.diff-column-content img,
.diff-column-content video,
.diff-column-content audio {
    max-width: 100%;
    height: auto;
    margin: 10px 0;
}
</style>
