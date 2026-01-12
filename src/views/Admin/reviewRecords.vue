<template>
    <div class="review-records">
        <el-form :inline="true" class="btn-form" @submit.prevent>
            <el-form-item label="关键词">
                <el-input
                    v-model="searchForm.keyword"
                    placeholder="文章标题关键词"
                    clearable
                    style="width: 200px"
                />
            </el-form-item>

            <el-form-item label="审核文章ID">
                <el-input
                    v-model="searchForm.article_id"
                    placeholder="请输入审核文章ID"
                    clearable
                    style="width: 200px"
                />
            </el-form-item>

            <el-form-item label="审核结果">
                <el-select
                    v-model="searchForm.review_result"
                    placeholder="请选择审核结果"
                    clearable
                    style="width: 120px"
                >
                    <el-option
                        v-for="opt in reviewOptions"
                        :key="opt.value"
                        :label="opt.value"
                        :value="opt.value"
                        >{{ opt.label }}</el-option
                    >
                </el-select>
            </el-form-item>
        </el-form>

        <el-table
            :data="recordList"
            style="width: 100%"
            border
            :loading="loading"
            empty-text="暂无审核记录"
        >
            <el-table-column
                prop="review_id"
                label="审核ID"
                width="100"
                sortable
            />
            <el-table-column
                prop="Reviewer.username"
                label="审核人"
                width="120"
                sortable
            />

            <el-table-column
                prop="article_id"
                label="审核文章ID"
                width="120"
                sortable
            />
            <el-table-column label="文章标题" min-width="200" sortable>
                <template #default="scope">
                    <el-link type="primary" @click="handleView(scope.row)">
                        <span
                            v-html="
                                highlightText(
                                    scope.row.Article.title,
                                    searchForm.keyword
                                )
                            "
                        />
                    </el-link>
                </template>
            </el-table-column>

            <el-table-column label="审核意见" min-width="200" sortable>
                <template #default="scope">
                    {{ scope.row.review_comments || '无' }}
                </template>
            </el-table-column>

            <el-table-column label="审核时间" width="180" sortable>
                <template #default="scope">
                    {{ scope.row.review_time }}
                </template>
            </el-table-column>

            <el-table-column label="审核结果" width="120" sortable>
                <template #default="scope">
                    <el-tag
                        :type="
                            scope.row.review_result === '通过'
                                ? 'success'
                                : scope.row.review_result === '拒绝'
                                ? 'danger'
                                : 'warning'
                        "
                        >{{ scope.row.review_result }}</el-tag
                    >
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
            class="pagination"
            background
            layout="total, prev, pager, next, sizes, jumper"
            :total="total"
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            size="small"
            :page-sizes="[10, 20, 30, 40, 50]"
            @size-change="loadRecords"
            @current-change="loadRecords"
        />
    </div>
</template>

<script lang="ts" setup>
import { debounce } from 'lodash-es';
import { type ArticleItem } from '@/api/article';
import { highlightText } from '@/utils/highlightText';
import {
    getReviewRecordsListAPI,
    type ReviewRecord,
    type ReviewListQuery,
} from '@/api/reviews';

const recordList = ref<ReviewRecord[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

type ReviewResult = '通过' | '拒绝' | '退回修订';

const searchForm = reactive({
    keyword: '',
    review_result: '' as ReviewResult,
    article_id: undefined as number | undefined,
});

const reviewOptions = [
    { value: '通过', label: '通过' },
    { value: '退回修订', label: '退回修订' },
    { value: '拒绝', label: '拒绝' },
] as const;

// 文章详情
const handleView = (row: ArticleItem) => {
    window.open(`/articleDetail/${row.article_id}`, '_blank');
};

// 加载审核记录
const loadRecords = async () => {
    loading.value = true;
    try {
        const params: ReviewListQuery = {
            page: currentPage.value,
            pageSize: pageSize.value,
        };

        // 文章标题关键词
        if (searchForm.keyword.trim()) {
            params.article_title = searchForm.keyword.trim();
        }

        //  审核结果
        if (searchForm.review_result) {
            params.review_result = searchForm.review_result;
        }

        // 审核文章 ID
        const articleIdNum = Number(searchForm.article_id);
        if (!isNaN(articleIdNum) && articleIdNum > 0) {
            params.article_id = articleIdNum;
        }

        // 调用 API
        const res = await getReviewRecordsListAPI(params);
        recordList.value = res.data.data.list;
        total.value = res.data.data.total;
    } catch (error) {
        console.error('加载审核记录失败:', error);
        recordList.value = [];
        total.value = 0;
    } finally {
        loading.value = false;
    }
};

// 防抖搜索
const debouncedLoad = debounce(() => {
    currentPage.value = 1; // 重置到第一页
    loadRecords();
}, 300);

// 监听搜索表单变化
watch(
    () => [searchForm.keyword, searchForm.review_result, searchForm.article_id],
    () => {
        debouncedLoad();
    }
);

onMounted(() => {
    loadRecords();
});
</script>

<style lang="scss" scoped>
.review-records {
    padding: 20px;
}

.pagination {
    margin-top: 20px;
    justify-content: flex-start;
}
</style>
