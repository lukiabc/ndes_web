<template>
    <div class="btn-header">
        <el-input
            v-model="search"
            placeholder="输入分类名称进行搜索"
            @keyup.enter="searchCategories"
        ></el-input>
        <el-button @click="searchCategories">搜索</el-button>
        <el-button style="margin-left: 10px" @click="showAddCategoryDialog"
            >添加分类
        </el-button>
    </div>
    <div>
        <el-table
            :data="treeData"
            style="width: 100%; margin-top: 20px"
            row-key="category_id"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            border
            v-loading="loading"
        >
            <el-table-column
                prop="category_name"
                label="分类名称"
                width="250"
                sortable
            />

            <el-table-column
                prop="category_id"
                label="ID"
                width="100"
                sortable
            />

            <el-table-column label="操作">
                <template #default="{ row }">
                    <el-button size="small" type="danger" @click="onEdit(row)">
                        编辑
                    </el-button>
                    <el-button
                        size="small"
                        type="primary"
                        @click="onDelete(row)"
                    >
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 添加分类对话框 -->
        <el-dialog v-model="addDialogVisible" title="添加分类" width="400px">
            <el-form @submit.prevent="handleAddSubmit">
                <el-form-item label="父分类">
                    <el-select
                        v-model="addForm.parent_id"
                        placeholder="请选择父分类"
                        clearable
                        style="width: 100%"
                    >
                        <el-option label="无父级" :value="0" />
                        <el-option
                            v-for="cat in allCategories"
                            :key="cat.category_id"
                            :label="cat.category_name"
                            :value="cat.category_id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="分类名称" required>
                    <el-input
                        v-model="addForm.category_name"
                        placeholder="请输入分类名称"
                    />
                </el-form-item>
                <el-alert
                    title="提示：选择“无父级”表示创建顶级分类"
                    type="info"
                    :closable="false"
                    show-icon
                    style="margin: 10px 0; font-size: 12px"
                />
            </el-form>
            <template #footer>
                <el-button @click="addDialogVisible = false">取消</el-button>
                <el-button
                    type="primary"
                    @click="handleAddSubmit"
                    :loading="loading"
                >
                    确定
                </el-button>
            </template>
        </el-dialog>

        <!-- 编辑对话框 -->
        <el-dialog v-model="editDialogVisible" title="编辑分类" width="400px">
            <el-form @submit.prevent="handleSubmit">
                <el-form-item label="分类名称" required>
                    <el-input
                        v-model="editForm.category_name"
                        placeholder="请输入分类名称"
                    />
                </el-form-item>
                <el-form-item label="父分类ID" required>
                    <el-input
                        v-model="editForm.parent_id"
                        placeholder="请输入父分类ID"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="editDialogVisible = false">取消</el-button>
                <el-button
                    type="primary"
                    @click="handleSubmit"
                    :loading="submitLoading"
                >
                    确定
                </el-button>
            </template>
        </el-dialog>

        <!-- 空对象 -->
        <el-empty
            v-if="!loading && treeData.length === 0"
            description="暂无分类数据"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import {
    getCategoryListAPI,
    deleteCategoryAPI,
    deleteCategoryAndChildrenAPI,
    updateCategoryAPI,
    searchCategoriesAPI,
    createCategoryAPI,
} from '@/api/category';

import { buildTree } from '@/utils/treeUtils';

interface Category {
    category_id: string;
    category_name: string;
    parent_id: number | null;
}

const loading = ref(false); // 加载状态
const flatData = ref<any[]>([]); // 扁平数据
const treeData = ref<any[]>([]); // 树形数据

const submitLoading = ref(false);
const search = ref(''); // 搜索关键字
// 是否处于搜索状态（用于判断是否要恢复原始数据）
const isSearching = ref(false);
const allCategories = ref<Category[]>([]); // 全部分类缓存（用于下拉选择）

// 添加分类对话框
const addDialogVisible = ref(false);
const addForm = ref<{
    category_name: string;
    parent_id: number | null;
}>({
    category_name: '',
    parent_id: null,
});

// 搜索分类
const searchCategories = async () => {
    if (!search.value.trim()) {
        fetchCategories();
        return;
    }
    loading.value = true;
    try {
        const res = await searchCategoriesAPI(search.value.trim(), 1, 50);

        if (res?.data?.data && Array.isArray(res.data.data)) {
            const results = res.data.data;

            if (results.length === 0) {
                ElMessage.info('未找到匹配的分类');
                treeData.value = [];
            } else {
                flatData.value = results; // 保存扁平结果
                treeData.value = buildTree(results); // 构建树
            }
            isSearching.value = true; // 标记为搜索状态
        } else {
            treeData.value = [];
            ElMessage.info('未找到匹配的分类');
        }
    } catch (error) {
        ElMessage.error('搜索失败，请稍后重试');
        console.error('搜索分类失败:', error);
        treeData.value = [];
    } finally {
        loading.value = false;
    }
};

//编辑
const editDialogVisible = ref(false);
const editForm = ref<{ category_name: string; parent_id: number | null }>({
    category_name: '',
    parent_id: null,
});
const currentRow = ref<Category | null>(null); // 当前编辑的行

// 获取所有分类
const fetchCategories = async () => {
    loading.value = true;
    try {
        const res = await getCategoryListAPI();
        if (res?.data && Array.isArray(res.data)) {
            flatData.value = res.data;
            allCategories.value = res.data; // 缓存全部数据用于下拉选择
            treeData.value = buildTree(res.data);
        } else {
            treeData.value = [];
            ElMessage.warning('分类数据为空');
        }
    } catch (error) {
        ElMessage.error('获取分类失败，请稍后重试');
        console.error('获取分类失败:', error);
        treeData.value = [];
    } finally {
        loading.value = false;
    }
};

// 显示添加对话框
const showAddCategoryDialog = () => {
    addForm.value = { category_name: '', parent_id: null };
    addDialogVisible.value = true;
};

// 提交添加分类
const handleAddSubmit = async () => {
    const name = addForm.value.category_name.trim();
    if (!name) {
        ElMessage.warning('分类名称不能为空');
        return;
    }
    const parentId =
        addForm.value.parent_id === 0 ? null : addForm.value.parent_id;

    console.log(parentId, '父类id');

    loading.value = true;
    try {
        await createCategoryAPI({
            category_name: name,
            parent_id: parentId,
        });
        ElMessage.success('添加分类成功');
        addDialogVisible.value = false;
        // 刷新数据
        isSearching.value && search.value.trim()
            ? searchCategories()
            : fetchCategories();
    } catch (error: any) {
        const msg = error.response?.data?.message || '添加失败，请稍后重试';
        ElMessage.error(msg);
        console.error('添加分类失败:', error);
    } finally {
        loading.value = false;
    }
};

// 编辑分类
const onEdit = (row: any) => {
    currentRow.value = row;
    editForm.value.category_name = row.category_name;
    editForm.value.parent_id = row.parent_id;
    editDialogVisible.value = true;
};

// 提交编辑
const handleSubmit = async () => {
    if (!currentRow.value) return;
    if (!editForm.value.category_name.trim()) {
        ElMessage.warning('分类名称不能为空');
        return;
    }

    submitLoading.value = true;
    try {
        await updateCategoryAPI(currentRow.value.category_id, {
            category_name: editForm.value.category_name,
            parent_id: currentRow.value.parent_id,
        });
        ElMessage.success('更新成功');
        editDialogVisible.value = false;
        fetchCategories(); // 刷新列表
    } catch (error) {
        ElMessage.error('更新失败，请重试');
        console.error('更新失败:', error);
    } finally {
        submitLoading.value = false;
    }
};

// 删除分类
const onDelete = (row: any) => {
    // 判断是否有子分类
    const isParent = row.children && row.children.length > 0;

    const deleteApi = isParent
        ? () => deleteCategoryAndChildrenAPI(row.category_id)
        : () => deleteCategoryAPI(row.category_id);

    const deleteType = isParent ? '及其所有子分类' : '';

    ElMessageBox.confirm(
        `确定要删除分类 "${row.category_name}" ${deleteType} 吗？`,
        '警告',
        {
            type: 'warning',
            confirmButtonText: '删除',
            cancelButtonText: '取消',
        }
    )
        .then(async () => {
            try {
                await deleteApi();
                ElMessage.success('删除成功');
                fetchCategories(); // 刷新列表
            } catch (error) {
                ElMessage.error('删除失败，请重试');
                console.error('删除失败:', error);
            }
        })
        .catch(() => {
            ElMessage.info('已取消删除');
        });
};

// 页面加载时获取数据
onMounted(() => {
    fetchCategories();
});
</script>

<style scoped></style>
