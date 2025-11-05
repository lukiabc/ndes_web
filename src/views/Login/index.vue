<template>
    <div class="login-body">
        <div class="login-panel">
            <div class="login-title">登录</div>
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

                <el-form-item prop="password">
                    <label class="iconfont icon-mima"> 密码：</label>
                    <el-input
                        v-model="form.password"
                        type="password"
                        placeholder="请输入密码"
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

                <el-button type="primary" class="login-button" @click="login">
                    登录
                </el-button>
            </el-form>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import Captcha from '@/components/Captcha.vue';

const router = useRouter();
const userStore = useUserStore();

const form = ref({
    username: '',
    password: '',
    captcha: '',
});

const formRef = ref();
const captchaRef = ref();

const rules = {
    username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
    password: [
        { required: true, message: '密码不能为空', trigger: 'blur' },
        { min: 6, max: 16, message: '密码长度必须在6-16之间', trigger: 'blur' },
    ],
    captcha: [
        {
            // 自定义校验函数，校验验证码是否正确
            validator: (_rule: any, _value: string, callback: Function) => {
                //检查 Captcha 组件是否加载（通过 ref 引用）
                if (!captchaRef.value) {
                    return callback(new Error('验证码组件未加载'));
                }
                // 调用 Captcha 组件的 validate 方法校验验证码
                const { valid, errMsg } = captchaRef.value.validate();
                if (!valid) {
                    callback(new Error(errMsg));
                } else {
                    callback();
                }
            },
            trigger: 'blur',
        },
    ],
};

const login = () => {
    formRef.value.validate(async (valid: boolean) => {
        if (valid) {
            console.log('校验通过');
            await userStore.getUserInfo({
                username: form.value.username,
                password: form.value.password,
            });
            if (userStore.userInfo.msg === '登录成功') {
                const role = Number(userStore.userInfo.result.role_id);
                ElMessage.success('登录成功');
                if (role === 1) {
                    router.replace('/admin');
                } else if (role === 2) {
                    router.replace('/user');
                } else {
                    ElMessage.error('未知角色');
                }
            } else {
                ElMessage.error(userStore.userInfo.msg);
                console.log(userStore.userInfo.msg, '登录失败信息');
            }
        } else {
            console.log('校验失败');
        }
    });
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
        min-width: 290px;
        height: 30%;
        min-height: 420px;
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
