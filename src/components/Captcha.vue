<!-- 验证码组件 -->
<template>
    <div class="captcha-wrapper">
        <el-input v-model="innerValue" :placeholder="placeholder" />
        <div
            class="captcha-img"
            v-html="svg"
            @click="refreshCaptcha"
            title="点击刷新"
        ></div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { getCaptchaAPI } from '@/api/captcha';

// placeholder 输入框的占位提示符
const props = defineProps<{
    placeholder?: string;
}>();

// update:modelValue 事件 用于双向绑定
const emit = defineEmits(['update:modelValue']);

const innerValue = ref(''); // 用户输入的验证码内容
const svg = ref('');
const captchaId = ref('');

// 暴露方法
defineExpose({
    // 验证方法 检查用户是否输入了验证码 以及验证码是否正确
    validate() {
        if (!innerValue.value) {
            return { valid: false, errMsg: '请输入验证码' };
        }
        if (!captchaId.value) {
            return { valid: false, errMsg: '验证码未加载' };
        }
        return { valid: true, errMsg: '' };
    },
    refreshCaptcha, // 刷新验证码
    getCaptchaId: () => captchaId.value, // 获取当前验证码 ID
});

/**
 * 刷新验证码
 * 调用后端接口获取新的验证码图片和 ID
 */
async function refreshCaptcha() {
    try {
        const res = await getCaptchaAPI();

        svg.value = res.data.svg;
        captchaId.value = res.data.captchaId;
        innerValue.value = ''; // 清空输入
    } catch (err) {
        console.error('获取验证码失败', err);
    }
}

// 初始化
refreshCaptcha();

// 双向绑定
watch(innerValue, (val) => {
    emit('update:modelValue', val);
});
</script>

<style scoped>
.captcha-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}
.captcha-img {
    cursor: pointer;
    width: 100px;
    height: 40px;
}
</style>
