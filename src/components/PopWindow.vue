<template>
    <!-- 弹框结构 -->
    <div class="modal-overlay" id="modalOverlay" v-if="isOpen">
        <div
            class="modal-container"
            :style="{
                '--color': bgColor,
                '--width': width,
                '--height': height,
            }"
        >
            <div class="modal-header">
                <h3 class="modal-title">{{ title }}</h3>
                <button class="modal-close" @click="closeModal">&times;</button>
            </div>
            <div class="modal-content">
                <slot></slot>
            </div>
            <div class="modal-footer">
                <slot name="footerbtn"></slot>
                <template v-if="showFooter">
                    <button
                        class="modal-btn modal-btn-secondary"
                        @click="closeModal"
                    >
                        取消
                    </button>
                    <button
                        class="modal-btn modal-btn-primary"
                        @click="submitModal"
                    >
                        确定
                    </button>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: '提示信息',
    },
    bgColor: {
        type: String,
    },
    width: String,
    height: String,
    showFooter: {
        type: Boolean,
        default: true,
    },
});
// 定义事件
const emit = defineEmits(['close', 'confirm']);

// 样式计算
const modalStyle = computed(() => ({
    width: props.width,
    height: props.height,
    backgroundColor: props.bgColor,
    borderRadius: '8px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
}));

// 关闭弹窗
const closeModal = () => {
    emit('close');
};

// 确认提交
const submitModal = () => {
    emit('confirm', true);
};
</script>

<style lang="scss" scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: var(--width, 300px);

    overflow: hidden;
    animation: modalFadeIn 0.3s ease-out;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border: 2px solid var(--color, #000);
}

.modal-header {
    padding: 16px 24px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-size: 18px;
    font-weight: bold;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    transition: color 0.2s;
}

.modal-close:hover {
    color: #333;
}

.modal-content {
    padding: 24px;
    line-height: 1.6;
    overflow: auto;
    max-height: var(--height, 300px);
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.modal-btn {
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
}

.modal-btn-primary {
    background-color: var(--color, #000);
    color: white;
}

.modal-btn-primary:hover {
    background-color: var(--color, #000);
}

.modal-btn-secondary {
    background-color: #f1f1f1;
    color: #333;
}

.modal-btn-secondary:hover {
    background-color: #e0e0e0;
}

@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.trigger-btn {
    padding: 12px 24px;
    background-color: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.trigger-btn:hover {
    background-color: #0d8bf2;
}
</style>
