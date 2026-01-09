<template>
    <div class="user-version-history">
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

        <el-table
            v-else
            :data="versionList"
            style="width: 100%"
            v-loading="reverting"
        >
            <!-- 所属文章 -->
            <el-table-column
                label="文章ID"
                prop="article_id"
                width="100"
                sortable
            />

            <el-table-column label="版本号" width="100">
                <template #default="{ row }"
                    >v{{ row.version_number }}</template
                >
            </el-table-column>

            <el-table-column label="文章标题" min-width="80">
                <template #default="{ row }">
                    <el-link
                        type="primary"
                        @click="goToArticle(row.article_id)"
                        style="margin-left: 8px"
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

            <el-table-column label="操作" width="140" fixed="right">
                <template #default="{ row }">
                    <el-button size="small" @click="showDetail(row)"
                        >查看</el-button
                    >
                    <el-button
                        size="small"
                        type="warning"
                        @click="handleRevert(row)"
                        :disabled="
                            reverting ||
                            row.total_versions < 2 ||
                            row.version_number === row.total_versions
                        "
                    >
                        回溯
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
            v-if="isLogin && !loading && versionList.length > 0"
            background
            layout="prev, pager, next, total"
            :current-page="page"
            :page-size="limit"
            :total="totalItems"
            @current-change="handlePageChange"
            style="margin-top: 20px; justify-content: center; display: flex"
        />

        <!-- 详情弹窗 -->
        <el-dialog
            v-model="dialogVisible"
            title="版本详情"
            width="60%"
            destroy-on-close
        >
            <div v-if="selectedVersion">
                <p>
                    <strong>文章：</strong>{{ selectedVersion.article?.title }}
                </p>
                <p>
                    <strong>版本号：</strong>v{{
                        selectedVersion.version_number
                    }}
                </p>
                <p>
                    <strong>编辑人：</strong
                    >{{ selectedVersion.editor || '系统' }}
                </p>
                <p>
                    <strong>时间：</strong
                    >{{ formatDate(selectedVersion.created_at) }}
                </p>
                <el-divider />
                <div
                    class="content-preview"
                    v-html="sanitizeHTML(selectedVersion.content)"
                ></div>
            </div>
            <template #footer>
                <el-button @click="dialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import DOMPurify from 'dompurify';

import {
    getVersionsByUserAPI,
    getVersionDetailAPI,
    revertToVersionAPI,
    type ArticleVersionItem,
} from '@/api/articleVersion';

import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const router = useRouter();

// 从 store 获取用户信息
const isLogin = computed(() => userStore.isLogin);
const currentUserId = computed(() => {
    return Number(userStore.userInfo.result.user_id);
});

// 状态
const loading = ref(false);
const reverting = ref(false);
const error = ref<string | null>(null);
const dialogVisible = ref(false);
const selectedVersion = ref<ArticleVersionItem | null>(null);

// 分页
const page = ref(1);
const limit = ref(10);
const totalItems = ref(0);
const versionList = ref<
    (ArticleVersionItem & {
        article: NonNullable<ArticleVersionItem['article']>;
    })[]
>([]);

// 工具函数
const formatDate = (dateStr: string) =>
    dayjs(dateStr).format('YYYY-MM-DD HH:mm');

// 截取摘要
const getExcerpt = (content: string) => {
    const clean = content.replace(/<[^>]+>/g, '');
    return clean.length > 80 ? clean.slice(0, 80) + '...' : clean;
};

const sanitizeHTML = (html: string) => {
    return DOMPurify.sanitize(html);
};

const goToArticle = (articleId: number) => {
    window.open(`/articleDetail/${articleId}`, '_blank');
};

// 获取用户版本列表
const fetchVersions = async () => {
    if (!isLogin.value || !currentUserId.value) {
        error.value = '用户未登录或 ID 无效';
        return;
    }

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

// 查看详情
const showDetail = async (version: (typeof versionList.value)[0]) => {
    try {
        const res = await getVersionDetailAPI(version.version_id);
        selectedVersion.value = res.data;
        dialogVisible.value = true;
    } catch {
        ElMessage.error('加载版本详情失败');
    }
};

// 回溯操作
const handleRevert = (version: (typeof versionList.value)[0]) => {
    ElMessageBox.confirm(
        `确定要将文章 <strong>${version.article.title}</strong> 回溯到 <strong>v${version.version_number}</strong> 吗？<br/>操作后会生成新版本，存到草稿箱中”。`,
        '确认回溯',
        {
            dangerouslyUseHTMLString: true,
            type: 'warning',
        }
    )
        .then(async () => {
            if (!currentUserId.value) return;

            reverting.value = true;
            try {
                await revertToVersionAPI(version.article_id, {
                    version_number: version.version_number,
                    user_id: currentUserId.value,
                    editor: userStore.userInfo.result.username,
                });
                ElMessage.success('回溯成功！已生成新版本。');
                fetchVersions(); // 刷新
            } catch (err: any) {
                ElMessage.error(
                    err?.response?.data?.message || '回溯失败，请重试'
                );
            } finally {
                reverting.value = false;
            }
        })
        .catch(() => {});
};

// 分页切换
const handlePageChange = (newPage: number) => {
    page.value = newPage;
    fetchVersions();
};

// 初始化
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
    min-height: 500px;
}

.content-preview {
    max-height: 400px;
    overflow-y: auto;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: sans-serif;
}
</style>
