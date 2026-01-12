<template>
    <div class="login-body">
        <div class="login-panel">
            <div class="login-title">注册</div>
            <el-divider></el-divider>

            <el-form ref="formRef" :model="form" :rules="rules" status-icon>
                <el-form-item prop="username">
                    <label class="iconfont icon-yonghu"> 用户名：</label>
                    <el-input
                        v-model="form.username"
                        placeholder="请输入用户名"
                        clearable
                    />
                </el-form-item>

                <el-form-item prop="email">
                    <label class="iconfont icon-youxiang"> 邮箱：</label>
                    <el-input
                        v-model="form.email"
                        placeholder="请输入邮箱"
                        clearable
                    />
                </el-form-item>

                <el-form-item prop="password">
                    <label class="iconfont icon-mima"> 密码：</label>
                    <el-input
                        v-model="form.password"
                        type="password"
                        placeholder="请输入密码（6-16位）"
                        show-password
                    />
                </el-form-item>

                <el-form-item prop="confirmPassword">
                    <label class="iconfont icon-mima"> 确认密码：</label>
                    <el-input
                        v-model="form.confirmPassword"
                        type="password"
                        placeholder="请再次输入密码"
                        show-password
                    />
                </el-form-item>

                <el-form-item
                    prop="captcha"
                    :label="''"
                    :required="false"
                    class="captcha-item"
                >
                    <label class="iconfont icon-yanzhengma"> 验证码：</label>
                    <Captcha
                        ref="captchaRef"
                        v-model="form.captcha"
                        placeholder="不区分大小写"
                    />
                </el-form-item>

                <el-button
                    type="primary"
                    class="login-button"
                    @click="register"
                >
                    注册
                </el-button>

                <div class="switch-link" @click="goToLogin">
                    ← 已有账号？立即登录
                </div>
            </el-form>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import Captcha from '@/components/Captcha.vue';
import { registerAPI } from '@/api/user';

const router = useRouter();

const form = ref({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    captcha: '',
});

const formRef = ref();
const captchaRef = ref();

// 自定义校验规则：确认密码
const validateConfirmPassword = (_: any, value: string, callback: any) => {
    if (value === '') {
        callback(new Error('请再次输入密码'));
    } else if (value !== form.value.password) {
        callback(new Error('两次输入的密码不一致'));
    } else {
        callback();
    }
};

const rules = {
    username: [
        { required: true, message: '用户名不能为空', trigger: 'blur' },
        { min: 2, max: 20, message: '用户名长度为2-20位', trigger: 'blur' },
    ],
    email: [
        { required: true, message: '邮箱不能为空', trigger: 'blur' },
        {
            type: 'email',
            message: '请输入有效的邮箱地址',
            trigger: ['blur', 'change'],
        },
    ],
    password: [
        { required: true, message: '密码不能为空', trigger: 'blur' },
        { min: 6, max: 16, message: '密码长度必须在6-16之间', trigger: 'blur' },
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' },
    ],
    captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
};

// 注册
const register = async () => {
    const valid = await formRef.value?.validate();
    if (!valid) return;

    const captchaId = captchaRef.value?.getCaptchaId();
    if (!captchaId) {
        ElMessage.error('验证码未加载，请刷新');
        return;
    }

    try {
        const res = await registerAPI({
            username: form.value.username,
            email: form.value.email,
            password: form.value.password,
        });

        ElMessage.success(res.data.message || '注册成功，请等待审核');
        router.push('/login');
    } catch (err: any) {
        let errorMessage = '注册失败';

        if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
        } else if (err.request) {
            errorMessage = '网络连接失败，请检查后端服务是否运行';
        } else {
            errorMessage = '请求配置错误：' + (err.message || '未知');
        }

        ElMessage.error(errorMessage);
        captchaRef.value?.refreshCaptcha(); // 刷新验证码
    }
};

const goToLogin = () => {
    router.push('/login');
};
</script>

<style lang="scss" scoped>
@import '@/assets/icon/iconfont.css';

.login-body {
    background: url('@/assets/images/login.png') no-repeat center center;
    height: 100%;
    width: 100%;
    background-size: cover;
    position: absolute;
    left: 0;
    top: 0;

    .login-panel {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;

        padding: 25px;
        width: 18%;
        min-width: 350px;
        height: 620px;
        min-height: 480px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 5%;
        box-shadow: 2px 2px 10px #ddd;

        .login-title {
            font-size: 22px;
            text-align: center;
            margin-bottom: 22px;
        }

        .iconfont {
            margin-left: 5px;
            color: #444444;
        }

        .switch-link {
            text-align: center;
            margin-top: 15px;
            color: #1890ff;
            cursor: pointer;
            font-size: 14px;
            user-select: none;
        }

        .switch-link:hover {
            text-decoration: underline;
        }
    }
}

.login-button {
    background: #e0251c;
    height: 32px;
    padding: 0;
    margin-top: 10px;
    width: 100%;
    line-height: 32px;
    border: none;
}
</style>
