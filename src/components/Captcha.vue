<!-- src/components/Captcha.vue -->
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

const props = defineProps<{
    placeholder?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const innerValue = ref('');
const svg = ref('');
const captchaId = ref('');

// 暴露方法
defineExpose({
    validate() {
        if (!innerValue.value) {
            return { valid: false, errMsg: '请输入验证码' };
        }
        if (!captchaId.value) {
            return { valid: false, errMsg: '验证码未加载' };
        }
        return { valid: true, errMsg: '' };
    },
    refreshCaptcha,
    getCaptchaId: () => captchaId.value,
});

// 获取验证码
async function refreshCaptcha() {
    try {
        const res = await getCaptchaAPI();
        console.log(res.data, '验证码数据');

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
