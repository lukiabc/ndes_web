<!-- 表单组件 -->
<template>
    <div class="form-vertical">
        <div class="form-item" v-for="item in formList" :key="item.name">
            <label class="form-label"> {{ item.label }}： </label>
            <input
                v-if="
                    [
                        'text',
                        'number',
                        'password',
                        'datetime-local',
                        'url',
                    ].includes(item.type)
                "
                :type="item.type"
                v-model="formObj[item.name]"
                class="form-input"
                :placeholder="'请输入' + item.label"
                :required="item.required !== false"
                :disabled="mode === 'detail'"
            />
            <textarea
                v-else-if="item.type === 'textarea'"
                v-model="formObj[item.name]"
                class="form-input"
                :placeholder="'请输入' + item.label"
                rows="4"
                :required="item.required !== false"
                :disabled="mode === 'detail'"
            ></textarea>

            <div v-else-if="item.type === 'checkbox'" class="checkbox-wrapper">
                <input
                    type="checkbox"
                    v-model="formObj[item.name]"
                    :required="item.required !== false"
                />
                <span>{{ item.label }}</span>
            </div>

            <!-- 文件/图片上传 + 预览 -->
            <div v-else-if="item.type === 'file'" class="upload-wrapper">
                <input
                    v-if="mode !== 'detail'"
                    type="file"
                    @change="handleFileUpload($event, item.name)"
                    :accept="item.accept || 'image/*'"
                    :disabled="mode === 'detail'"
                />
                <!-- 图片预览 -->
                <div class="image-preview" v-if="formObj[item.name]">
                    <img
                        :src="getImageSrc(formObj[item.name])"
                        alt="预览"
                        style="
                            max-width: 100%;
                            max-height: 200px;
                            border-radius: 4px;
                        "
                    />
                </div>
            </div>
            <div class="footer" v-if="showFooter">
                <button class="btn1" @click="submitData">确认</button>
                <button class="btn2" @click="cancel">取消</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const props = defineProps({
    formList: {
        type: Array,
        required: true,
    },
    editItem: {
        type: Object,
        default: () => ({}),
    },
    mode: {
        type: String,
        default: 'add',
    },
    showFooter: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(['submitData', 'cancel']);

// const formObj = reactive({ ...props.editItem });

const formObj = reactive({});

// 当 editItem 改变时，自动更新 formObj
watchEffect(() => {
    // 清空旧数据
    Object.keys(formObj).forEach((key) => delete formObj[key]);
    // 浅拷贝新数据
    const item = props.editItem;
    if (item) {
        Object.assign(formObj, item);
    }
});

// 处理文件上传
const handleFileUpload = (event, fieldName) => {
    const file = event.target.files[0];
    if (file) {
        formObj[fieldName] = file;
    }
};

// 获取图片预览 URL
const getImageSrc = (file) => {
    if (file instanceof File || file instanceof Blob) {
        return URL.createObjectURL(file);
    } else if (typeof file === 'string') {
        return file;
    }
    return '';
};

const submitData = () => {
    const formData = new FormData();

    Object.keys(formObj).forEach((key) => {
        const value = formObj[key];

        if (key === 'avatar_url') {
            if (value instanceof File) {
                formData.append('avatar', value);
            } else if (typeof value === 'string' && value) {
                formData.append('avatar', value);
            } else {
                formData.append('avatar', ''); // 或跳过
            }
        } else {
            formData.append(key, value ?? '');
        }
    });

    emit('submitData', formData);
};

const cancel = () => {
    emit('cancel', {});
};
</script>

<style lang="scss" scoped>
.form-vertical {
    width: 100%;
    font-family: Arial, sans-serif;
}

.form-item {
    margin-bottom: 15px;
}

.form-label {
    display: block;
    text-align: left;
    font-weight: bold;
    color: #333;
    margin-bottom: 6px;
    font-size: 14px;
}

.form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
    transition: border-color 0.3s;
}

.form-input:focus {
    outline: none;
    border-color: #007bff;
}

/* 图片上传区域 */
.upload-wrapper {
    display: flex;
    flex-direction: column;
    width: 100px;
    height: 150px;
    gap: 8px;
}

.upload-wrapper input[type='file'] {
    padding: 6px 0;
    width: 100%;
}

.image-preview {
    margin-top: 10px;
    text-align: center;
}

.image-preview img {
    max-width: 100%;
    max-height: 200px;
    border: 1px solid #eee;
    border-radius: 4px;
    object-fit: contain;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 复选框样式 */
.checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}
.footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    padding: 10px 20px;
    button {
        border: none;
        border-radius: 5px;
        margin-left: 10px;
        width: 45px;
        height: 30px;
        cursor: pointer;
    }
    .btn1 {
        background-color: rgb(162, 221, 244);
    }
}
</style>
