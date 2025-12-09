<template>
    <div class="carousel-management">
        <el-table
            :data="carouselList"
            style="width: 100%"
            border
            :loading="loading"
            empty-text="暂无轮播图数据"
        >
            <el-table-column
                prop="carousel_id"
                label="ID"
                width="80"
                sortable
            />

            <el-table-column label="封面图" width="120">
                <template #default="scope">
                    <el-image
                        :src="scope.row.cover_image"
                        fit="cover"
                        style="width: 80px; height: 45px; border-radius: 4px"
                        :preview-src-list="[scope.row.cover_image]"
                    />
                </template>
            </el-table-column>

            <el-table-column
                prop="title"
                label="轮播标题"
                min-width="160"
                sortable
            >
                <template #default="scope">
                    <span v-html="highlightText(scope.row.title, '')" />
                </template>
            </el-table-column>

            <el-table-column
                prop="article_id"
                label="关联文章ID"
                width="120"
                sortable
            />

            <el-table-column
                prop="sort_order"
                label="排序权重"
                width="120"
                sortable
            />

            <el-table-column label="状态" width="120">
                <template #default="scope">
                    <el-tag :type="getCarouselStatusType(scope.row)">
                        {{ getCarouselStatusText(scope.row) }}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column label="播放时间" min-width="120">
                <template #default="scope">
                    <div
                        v-if="
                            scope.row.start_play_date || scope.row.end_play_date
                        "
                    >
                        <div>
                            开始：{{ formatDate(scope.row.start_play_date) }}
                        </div>
                        <div>
                            结束：{{ formatDate(scope.row.end_play_date) }}
                        </div>
                    </div>
                    <span v-else>—</span>
                </template>
            </el-table-column>
            <el-table-column label="添加时间" width="160">
                <template #default="scope">
                    {{ formatDate(scope.row.created_at) }}
                </template>
            </el-table-column>

            <el-table-column label="操作" min-width="140">
                <template #default="scope">
                    <el-button
                        size="small"
                        type="primary"
                        @click="handleEdit(scope.row)"
                    >
                        编辑
                    </el-button>
                    <el-button
                        size="small"
                        type="danger"
                        @click="handleDelete(scope.row.carousel_id)"
                    >
                        移除
                    </el-button>
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
            @size-change="loadCarousels"
            @current-change="loadCarousels"
        />

        <!-- 编辑弹窗 -->
        <AddToCarouselDialog
            v-model:visible="editDialogVisible"
            :article-id="editingItem?.article_id || 0"
            :article-title="editingItem?.title || ''"
            :is-edit="true"
            :carousel-id="editingItem?.carousel_id || 0"
            :initial-data="editingItem"
            @success="onEditSuccess"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
    getCarouselsAPI,
    deleteCarouselsAPI,
    type Carousel,
} from '@/api/carousels';
import AddToCarouselDialog from '@/views/Admin/components/AddToCarouselDialog.vue';

// 数据
const carouselList = ref<Carousel[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

// 弹窗控制
const editDialogVisible = ref(false);
const editingItem = ref<Carousel | null>(null);

// 工具函数
const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');
    return text.replace(
        regex,
        '<mark style="background: #ffecd3; padding: 0 2px;">$1</mark>'
    );
};

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;
};

// 格式化本地日期
const parseDateAsLocal = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// 获取状态文本
const getCarouselStatusText = (item: Carousel): string => {
    if (!item.is_active) {
        return '已停用';
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const start = item.start_play_date
        ? parseDateAsLocal(item.start_play_date)
        : null;
    const end = item.end_play_date
        ? parseDateAsLocal(item.end_play_date)
        : null;

    if (start && today < start) {
        return '未开始';
    }
    if (end && today > end) {
        return '已过期';
    }
    return '播放中';
};

// 获取状态标签类型（颜色）
const getCarouselStatusType = (
    item: Carousel
): 'success' | 'warning' | 'info' | 'danger' => {
    if (!item.is_active) return 'danger';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const start = item.start_play_date
        ? parseDateAsLocal(item.start_play_date)
        : null;
    const end = item.end_play_date
        ? parseDateAsLocal(item.end_play_date)
        : null;

    if (start && today < start) return 'warning'; // 未开始
    if (end && today > end) return 'info'; // 已过期
    return 'success'; // 播放中
};

// 加载轮播图列表
const loadCarousels = async () => {
    loading.value = true;
    try {
        const res = await getCarouselsAPI(currentPage.value, pageSize.value);
        const data = res.data as any; // 假设后端返回 { list, total }
        carouselList.value = data.list || [];
        total.value = data.total || 0;
    } catch (error) {
        ElMessage.error('加载轮播图失败');
        carouselList.value = [];
        total.value = 0;
    } finally {
        loading.value = false;
    }
};

// 编辑
const handleEdit = (item: Carousel) => {
    editingItem.value = { ...item };
    editDialogVisible.value = true;
};

// 删除
const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定删除该轮播图？此操作不可恢复。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            try {
                await deleteCarouselsAPI(id);
                ElMessage.success('删除成功');
                loadCarousels(); // 刷新列表
            } catch (err) {
                ElMessage.error('删除失败');
            }
        })
        .catch(() => {});
};

// 编辑成功回调
const onEditSuccess = () => {
    editDialogVisible.value = false;
    editingItem.value = null;
    loadCarousels();
};

// 初始化
onMounted(() => {
    loadCarousels();
});
</script>

<style lang="scss" scoped>
.carousel-management {
    padding: 20px;
}

.pagination {
    margin-top: 20px;
    justify-content: flex-start;
}
</style>
