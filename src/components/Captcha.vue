<!-- 验证码组件 -->
<template>
    <el-form-item :prop="prop">
        <div class="captcha-group">
            <el-input
                v-model="inputCode"
                :placeholder="placeholder"
                @input="handleInput"
                clearable
                style="flex: 1; margin-right: 10px"
            />
            <!-- 验证码展示 -->
            <div class="captcha-display" @click="refreshCaptcha">
                <span
                    v-for="(char, index) in captcha"
                    :key="index"
                    :style="{
                        color: getRandomColor(),
                        transform: `rotate(${getRandomRotate()}deg)`,
                        fontSize: `${getRandomSize()}px`,
                        fontWeight: 'bold',
                    }"
                >
                    {{ char }}
                </span>
            </div>
        </div>
    </el-form-item>
</template>

<script lang="ts" setup>
interface Props {
    modelValue: string;
    label?: string;
    prop?: string;
    placeholder?: string;
}

// 设置默认值
const props = withDefaults(defineProps<Props>(), {
    label: '验证码',
    prop: '',
    placeholder: '请输入验证码',
});

const emit = defineEmits(['update:modelValue', 'change']);

const inputCode = ref('');
const captcha = ref('');

// 生成随机验证码
const refreshCaptcha = () => {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    captcha.value = code;
};

// 随机颜色
const getRandomColor = () => {
    const colors = ['#069', '#d44', '#38c', '#c60', '#333', '#800'];
    return colors[Math.floor(Math.random() * colors.length)];
};

// 随机旋转
const getRandomRotate = () =>
    (Math.random() > 0.5 ? '' : '-') + Math.floor(Math.random() * 30);

// 随机字号
const getRandomSize = () => [16, 17, 18, 19, 20][Math.floor(Math.random() * 5)];

// 输入框值
const handleInput = (val: string) => {
    emit('update:modelValue', val);
    emit('change', val);
};

// 校验方法
const validate = (): { valid: boolean; errMsg: string } => {
    const value = inputCode.value?.trim();
    if (!value) return { valid: false, errMsg: `${props.label}不能为空` };
    if (value.toLowerCase() !== captcha.value.toLowerCase()) {
        return { valid: false, errMsg: '验证码错误' };
    }
    return { valid: true, errMsg: '' };
};

// 暴露给外部调用
defineExpose({ validate, refreshCaptcha });

// 初始化
refreshCaptcha();
</script>

<style scoped>
.captcha-group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.captcha-display {
    border: 1px solid #ddd;
    padding: 5px 10px;
    border-radius: 4px;
    background-color: #f9f9f9;
    user-select: none;
    cursor: pointer;
    font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
    letter-spacing: 1px;
    white-space: nowrap;
    min-width: 80px;
    text-align: center;
}

.captcha-display span {
    display: inline-block;
    width: 16px;
    text-align: center;
    margin: 0 1px;
}
</style>
