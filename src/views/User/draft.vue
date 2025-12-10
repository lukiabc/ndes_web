<!-- 草稿箱 -->
<template>
    <div class="draft-box">
        <div class="filters">
            <el-input
                v-model="searchTitle"
                placeholder="搜索草稿标题"
                style="width: 240px"
                clearable
                @keyup.enter.stop
            >
                <template #prefix>
                    <el-icon><Search /></el-icon>
                </template>
            </el-input>
        </div>

        <!-- 加载中 -->
        <el-skeleton v-if="loading" :rows="5" animated />

        <!-- 草稿列表 -->
        <div v-else-if="draftList.length > 0" class="draft-list">
            <ArticleList
                v-for="article in draftList"
                :key="article.article_id"
                :article="article"
                :draft-mode="true"
                :show-publish-date="false"
                @edit="editArticle"
                @delete="deleteArticle"
            />
        </div>

        <!-- 空状态 -->
        <el-empty v-else description="暂无草稿，快去写一篇吧！" />

        <!-- 分页 -->
        <el-pagination
            v-if="total > pageSize"
            class="pagination"
            background
            layout="total, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handlePageChange"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { debounce } from 'lodash-es';

import { useUserStore } from '@/stores/userStore';
import {
    searchArticlesByUserAPI,
    deleteArticleAPI,
    type ArticleItem,
} from '@/api/article';
import ArticleList from '@/views/User/components/ArticleList.vue';

const userStore = useUserStore();
const userId = computed(() => userStore.userInfo.result.user_id);

const loading = ref(false);
const draftList = ref<ArticleItem[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = 10;
const searchTitle = ref('');

const fetchDrafts = async (page: number = 1) => {
    if (!userId.value) {
        ElMessage.warning('用户信息异常，请重新登录');
        return;
    }

    loading.value = true;
    try {
        const res = await searchArticlesByUserAPI(
            Number(userId.value),
            searchTitle.value.trim() || undefined,
            '草稿',
            page,
            pageSize
        );
        draftList.value = res.data.list;
        total.value = res.data.total;
        currentPage.value = page;
    } catch (error) {
        console.error('加载草稿失败:', error);
        ElMessage.error('加载草稿失败');
        draftList.value = [];
        total.value = 0;
    } finally {
        loading.value = false;
    }
};

const debouncedSearch = debounce(() => {
    if (currentPage.value !== 1) currentPage.value = 1;
    fetchDrafts(1);
}, 300);

watch(searchTitle, debouncedSearch);

const handlePageChange = (page: number) => {
    currentPage.value = page;
    fetchDrafts(page);
};

const router = useRouter();

const editArticle = (id: number) => {
    const url = router.resolve(`/article/edit/${id}`).href;
    window.open(url, '_blank');
};

const deleteArticle = async (id: number) => {
    try {
        await ElMessageBox.confirm(
            '确定要删除这篇草稿？此操作不可恢复。',
            '警告',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );
        await deleteArticleAPI(id);
        ElMessage.success('删除成功');
        fetchDrafts(currentPage.value);
    } catch (error) {
        if (error !== 'cancel') ElMessage.error('删除失败');
    }
};

onMounted(() => fetchDrafts(1));
</script>

<style lang="scss" scoped>
.draft-box {
    .filters {
        margin-bottom: 20px;
    }

    .draft-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .pagination {
        margin-top: 24px;
        display: flex;
        justify-content: center;
    }
}
</style>
