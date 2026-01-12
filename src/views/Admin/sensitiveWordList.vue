<template>
    <div class="btn-header">
        <el-input
            v-model="searchKey"
            placeholder="输入敏感词进行搜索"
            style="width: 240px"
            clearable
            @keyup.enter="handleSearch"
        />
        <el-button @click="handleSearch">搜索</el-button>
        <el-button @click="handleAdd">添加敏感词</el-button>
    </div>

    <el-table :data="sensitiveWordList" style="width: 100%">
        <el-table-column label="ID" prop="id" min-width="100" sortable />
        <el-table-column label="敏感词" prop="word" min-width="180" sortable />
        <el-table-column label="操作" min-width="180">
            <template #default="scope">
                <el-button
                    size="small"
                    type="danger"
                    @click="handleEdit(scope.row)"
                >
                    编辑
                </el-button>
                <el-button
                    size="small"
                    type="primary"
                    @click="handleDelete(scope.row)"
                >
                    删除
                </el-button>
            </template>
        </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination" style="margin-top: 20px; text-align: right">
        <el-pagination
            size="small"
            :current-page="page"
            :page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next, sizes, jumper"
            :page-sizes="[10, 20, 30, 40, 50]"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
        />
    </div>

    <!-- 添加/编辑 敏感词弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加敏感词' : '编辑敏感词'"
        width="400px"
        @close="handleDialogClose"
    >
        <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
            <el-form-item label="敏感词" prop="word">
                <el-input
                    v-model="form.word"
                    placeholder="请输入敏感词"
                    maxlength="10"
                    show-word-limit
                />
            </el-form-item>
        </el-form>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="danger" @click="submitForm"> 确定 </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import {
    ElMessage,
    ElMessageBox,
    type FormInstance,
    type FormRules,
} from 'element-plus';
import {
    getSensitiveWordListAPI,
    searchSensitiveWordsAPI,
    deleteSensitiveWordAPI,
    createSensitiveWordAPI,
    updateSensitiveWordAPI,
} from '@/api/sensitiveWord';

// 搜索关键词
const searchKey = ref('');

// 分页参数
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 表格数据
const sensitiveWordList = ref([]);

// 弹窗控制
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formRef = ref<FormInstance>();

// 表单数据
const form = ref({
    id: 0,
    word: '',
});

// 表单验证规则
const rules = ref<FormRules>({
    word: [
        { required: true, message: '敏感词不能为空', trigger: 'blur' },
        { min: 1, max: 50, message: '长度在 1 到 10 个字符', trigger: 'blur' },
    ],
});

// 获取敏感词列表
const getSensitiveWords = async () => {
    try {
        // 根据是否油搜索关键词决定调用哪个 API
        const api = searchKey.value
            ? searchSensitiveWordsAPI(
                  searchKey.value,
                  page.value,
                  pageSize.value
              )
            : getSensitiveWordListAPI(page.value, pageSize.value);

        const res = await api;
        const data = res.data;

        sensitiveWordList.value = data.list || [];
        total.value = data.total || 0;
    } catch (error) {
        ElMessage.error('加载敏感词列表失败');
        sensitiveWordList.value = [];
        total.value = 0;
    }
};

// 搜索
const handleSearch = () => {
    page.value = 1; // 重置到第一页
    getSensitiveWords();
};

// 分页变化
const handleCurrentChange = (newPage: number) => {
    page.value = newPage;
    getSensitiveWords();
};

// 每页条数变化
const handleSizeChange = (newSize: number) => {
    pageSize.value = newSize;
    page.value = 1;
    getSensitiveWords();
};

// 删除敏感词
const handleDelete = async (row: any) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除敏感词 "${row.word}" 吗？`,
            '警告',
            {
                type: 'warning',
            }
        );
        await deleteSensitiveWordAPI(row.id);
        ElMessage.success('删除成功');
        // 重新加载列表
        getSensitiveWords();
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败');
        }
    }
};

// 打开添加弹窗
const handleAdd = () => {
    dialogType.value = 'add';
    form.value.word = '';
    dialogVisible.value = true;
};

// 打开编辑弹窗
const handleEdit = (row: any) => {
    dialogType.value = 'edit';
    form.value.id = row.id;
    form.value.word = row.word;
    dialogVisible.value = true;
};

// 弹窗关闭时重置表单
const handleDialogClose = () => {
    formRef.value?.resetFields();
};

// 提交表单（添加 or 编辑）
const submitForm = async () => {
    if (!formRef.value) return;

    try {
        const valid = await formRef.value.validate();
        if (!valid) return;

        if (dialogType.value === 'add') {
            await createSensitiveWordAPI(form.value.word);
        } else {
            await updateSensitiveWordAPI(
                form.value.id.toString(),
                form.value.word
            );
        }

        ElMessage.success('操作成功');
        dialogVisible.value = false;
        getSensitiveWords();
    } catch (error) {
        ElMessage.error('操作失败');
    }
};

// 页面加载时获取数据
onMounted(() => {
    getSensitiveWords();
});
</script>

<style scoped>
.btn-header {
    margin-bottom: 20px;
}
</style>
