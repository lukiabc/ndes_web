<!-- 轮播图详情弹窗 -->
<template>
    <!-- append-to-body 确保弹窗挂载到 body 下，避免被父级样式遮挡；-->
    <el-dialog
        v-model="visible"
        title="轮播图详情"
        width="500px"
        append-to-body
        @close="handleClose"
    >
        <!--
            使用 el-descriptions 展示结构化信息，单列布局(:column="1") 带边框(border)
        -->
        <el-descriptions :column="1" border>
            <el-descriptions-item label="文章标题">
                {{ carouselItem?.title || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="封面图">
                <el-image
                    v-if="carouselItem?.cover_image"
                    style="width: 120px; height: 80px; object-fit: cover"
                    :src="carouselItem.cover_image"
                    :preview-src-list="[carouselItem.cover_image]"
                    fit="cover"
                />
                <span v-else>--</span>
            </el-descriptions-item>
            <el-descriptions-item label="添加时间">
                {{ formatDate(carouselItem?.created_at) }}
            </el-descriptions-item>
            <el-descriptions-item label="开始播放时间">
                {{
                    carouselItem?.start_play_date
                        ? formatDate(carouselItem.start_play_date)
                        : '立即生效'
                }}
            </el-descriptions-item>
            <el-descriptions-item label="结束播放时间">
                {{
                    carouselItem?.end_play_date
                        ? formatDate(carouselItem.end_play_date)
                        : '永久有效'
                }}
            </el-descriptions-item>
            <el-descriptions-item label="排序值">
                {{ carouselItem?.sort_order ?? 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="当前状态">
                <el-tag :type="getStatusTagType()">
                    {{ getStatusText() }}
                </el-tag>
            </el-descriptions-item>
        </el-descriptions>

        <template #footer>
            <el-button @click="handleClose">关闭</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
interface CarouselItem {
    id?: number;
    article_id: number;
    title: string;
    cover_image: string;
    sort_order: number;
    is_active: boolean;
    start_play_date?: string;
    end_play_date?: string;
    created_at: string;
}

const props = defineProps<{
    modelValue: boolean; // 控制弹窗显示隐藏
    carouselItem: CarouselItem | null; // 轮播图详情数据
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void; // 更新弹窗显示隐藏状态
    (e: 'close'): void; // 关闭弹窗事件
}>();

const visible = computed({
    // 获取弹窗显示隐藏状态
    get() {
        return props.modelValue;
    },
    // 设置弹窗显示隐藏状态
    set(val) {
        emit('update:modelValue', val);
    },
});

// 关闭弹窗事件处理函数
const handleClose = () => {
    emit('update:modelValue', false);
    emit('close');
};

// 格式化日期函数
// ("2025-12-09 14:30:00")输出 "YYYY-MM-DD HH:mm" 格式
const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
    )}-${String(date.getDate()).padStart(2, '0')} ${String(
        date.getHours()
    ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 判断当前真实状态
const getStatusText = () => {
    if (!props.carouselItem) return '未知';
    if (!props.carouselItem.is_active) return '已停用';

    const now = new Date();
    const start = props.carouselItem.start_play_date
        ? new Date(props.carouselItem.start_play_date)
        : null;
    const end = props.carouselItem.end_play_date
        ? new Date(props.carouselItem.end_play_date)
        : null;

    if (start && now < start) return '未开始';
    if (end && now > end) return '已过期';
    return '播放中';
};

// 状态标签颜色
const getStatusTagType = () => {
    const text = getStatusText();
    if (text === '播放中') return 'success';
    if (text === '未开始') return 'warning';
    if (text === '已过期') return 'info';
    return 'danger';
};
</script>
